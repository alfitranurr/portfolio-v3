// Mengukur performa gambar & LCP per halaman, untuk dibandingkan antar fase optimasi.
// Lihat docs/PERFORMANCE_OPTIMIZATION_PLAN.md (§5 Verifikasi).
//
// Pemakaian:
//   node scripts/measure-images.mjs --label baseline
//   node scripts/measure-images.mjs --label fase-0 --base http://localhost:3000
//   MEASURE_ADMIN_EMAIL=... MEASURE_ADMIN_PASSWORD=... node scripts/measure-images.mjs --label baseline-admin --only admin
//   --only public|admin  → batasi halaman yang diukur (default: semua; admin hanya jika kredensial ada)
//
// Hasil: docs/perf/<label>.json dan docs/perf/<label>.md
//
// Catatan metodologi:
// - Setiap halaman dibuka di browser context baru dengan cache dimatikan (cold load).
// - Intro loader dilewati (sessionStorage `has_loaded_intro`) agar LCP mengukur konten, bukan overlay.
// - Visitor tracking dimatikan (sessionStorage `portfolio_session_tracked`) agar analytics tidak tercemar.
//   Tidak memakai page.route() supaya throttling/ukuran transfer CDP tetap akurat.

import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]?.startsWith('--') ? 'true' : arr[i + 1] ?? 'true'])
    return acc
  }, [])
)

const BASE = (args.base || 'https://alfitranurr.vercel.app').replace(/\/$/, '')
const LABEL = args.label || `run-${new Date().toISOString().slice(0, 10)}`
const ONLY = args.only || 'all'
const OUT_DIR = path.resolve('docs/perf')

const PUBLIC_PAGES = ['/', '/projects', '/certificates', '/experience', '/education']
const ADMIN_PAGES = ['/admin/projects', '/admin/certificates', '/admin/photos', '/admin/experience', '/admin/education', '/admin/skills']

const PROFILES = {
  desktop: {
    label: 'Desktop 1440×900, DPR 1, tanpa throttle',
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    network: null,
  },
  mobile: {
    label: 'Mobile 412×915, DPR 2.625, 4G (9 Mbps / 60 ms RTT)',
    context: {
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    },
    network: { latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 },
  },
}

const INIT_SCRIPT = () => {
  try {
    sessionStorage.setItem('has_loaded_intro', 'true')
    sessionStorage.setItem('portfolio_session_tracked', 'true')
  } catch {}
  window.__lcp = []
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const el = e.element
        window.__lcp.push({
          startTime: e.startTime,
          size: e.size,
          url: e.url || null,
          tag: el ? el.tagName.toLowerCase() : null,
          text: el && !e.url ? (el.textContent || '').trim().slice(0, 60) : null,
        })
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {}
}

function waitForNetworkIdle(page, tracker, { idleMs = 2000, timeoutMs = 90000 } = {}) {
  return new Promise((resolve) => {
    const start = Date.now()
    let idleSince = tracker.inflight === 0 ? Date.now() : null
    const iv = setInterval(() => {
      if (tracker.inflight === 0) {
        idleSince ??= Date.now()
        if (Date.now() - idleSince >= idleMs) {
          clearInterval(iv)
          resolve(true)
        }
      } else {
        idleSince = null
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(iv)
        resolve(false)
      }
    }, 100)
  })
}

async function snapshotDom(page) {
  return page.evaluate(() => {
    const dpr = window.devicePixelRatio || 1
    const vh = window.innerHeight
    const resources = performance.getEntriesByType('resource')
    const findRes = (src) => resources.find((r) => r.name === src)
    const imgs = [...document.querySelectorAll('img')].map((img) => {
      const r = img.getBoundingClientRect()
      const src = img.currentSrc || img.src
      const res = findRes(src)
      return {
        src,
        loading: img.getAttribute('loading'),
        hasSrcset: !!img.getAttribute('srcset'),
        naturalWidth: img.naturalWidth,
        renderedWidth: Math.round(r.width),
        complete: img.complete,
        aboveFold: r.top < vh && r.bottom > 0 && r.width > 0,
        responseEnd: res ? Math.round(res.responseEnd) : null,
      }
    })
    const nav = performance.getEntriesByType('navigation')[0]
    return {
      dpr,
      imgs,
      preloadImageLinks: document.querySelectorAll('link[rel="preload"][as="image"]').length,
      ttfb: nav ? Math.round(nav.responseStart) : null,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEvent: nav ? Math.round(nav.loadEventEnd) : null,
      lcp: (window.__lcp || []).at(-1) || null,
    }
  })
}

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8))
    for (let i = 0; i < 200; i++) {
      const before = window.scrollY
      window.scrollBy(0, step)
      await new Promise((r) => setTimeout(r, 350))
      if (window.scrollY === before) break
    }
  })
}

function summarizeRequests(requests) {
  const imgs = requests.filter((r) => r.type === 'image' && !r.url.startsWith('data:'))
  return {
    count: imgs.length,
    bytes: imgs.reduce((s, r) => s + r.bytes, 0),
    hosts: [...new Set(imgs.map((r) => { try { return new URL(r.url).host } catch { return '?' } }))],
    cacheControl: [...new Set(imgs.map((r) => r.cacheControl).filter(Boolean))].slice(0, 5),
    contentTypes: [...new Set(imgs.map((r) => r.contentType).filter(Boolean))],
    largest: [...imgs].sort((a, b) => b.bytes - a.bytes).slice(0, 5).map((r) => ({ url: r.url, bytes: r.bytes })),
  }
}

async function measurePage(browser, profileKey, pagePath, storageState) {
  const profile = PROFILES[profileKey]
  const context = await browser.newContext({ ...profile.context, storageState })
  await context.addInitScript(INIT_SCRIPT)

  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  if (profile.network) {
    await cdp.send('Network.emulateNetworkConditions', { offline: false, ...profile.network })
  }

  const tracker = { inflight: 0 }
  const requests = []
  page.on('request', () => tracker.inflight++)
  page.on('requestfailed', () => tracker.inflight--)
  page.on('requestfinished', async (req) => {
    tracker.inflight--
    try {
      const sizes = await req.sizes()
      const res = await req.response()
      const headers = res ? await res.allHeaders() : {}
      requests.push({
        url: req.url(),
        type: req.resourceType(),
        bytes: sizes.responseBodySize + sizes.responseHeadersSize,
        cacheControl: headers['cache-control'] || null,
        contentType: headers['content-type'] || null,
      })
    } catch {}
  })

  const t0 = Date.now()
  let error = null
  try {
    await page.goto(BASE + pagePath, { waitUntil: 'load', timeout: 120000 })
  } catch (e) {
    error = String(e.message || e).split('\n')[0]
  }
  await waitForNetworkIdle(page, tracker, { timeoutMs: 60000 })
  const initial = await snapshotDom(page)
  const initialReq = summarizeRequests(requests)
  const initialWall = Date.now() - t0

  await scrollToBottom(page)
  await waitForNetworkIdle(page, tracker, { timeoutMs: 90000 })
  const full = await snapshotDom(page)
  const fullReq = summarizeRequests(requests)

  const aboveFold = initial.imgs.filter((i) => i.aboveFold)
  const aboveFoldDone = aboveFold.map((i) => i.responseEnd).filter((v) => v != null)
  const oversized = full.imgs.filter(
    (i) => i.naturalWidth > 0 && i.renderedWidth > 0 && i.naturalWidth / (i.renderedWidth * full.dpr) > 2
  )
  const eagerOrDefault = full.imgs.filter((i) => i.loading !== 'lazy').length

  const finalUrl = page.url()
  await context.close()

  return {
    profile: profileKey,
    path: pagePath,
    error,
    finalUrl,
    ttfbMs: initial.ttfb,
    loadEventMs: initial.loadEvent,
    lcpMs: initial.lcp ? Math.round(initial.lcp.startTime) : null,
    lcpElement: initial.lcp,
    aboveFoldImages: aboveFold.length,
    aboveFoldImagesLoadedMs: aboveFoldDone.length ? Math.max(...aboveFoldDone) : null,
    initialWallMs: initialWall,
    initial: initialReq,
    full: fullReq,
    imgElements: full.imgs.length,
    imgNotLazy: eagerOrDefault,
    imgWithSrcset: full.imgs.filter((i) => i.hasSrcset).length,
    preloadImageLinks: initial.preloadImageLinks,
    oversizedCount: oversized.length,
    oversizedWorst: oversized
      .map((i) => ({ src: i.src, naturalWidth: i.naturalWidth, renderedWidth: i.renderedWidth, ratio: +(i.naturalWidth / (i.renderedWidth * full.dpr)).toFixed(1) }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3),
  }
}

async function findProjectDetailPath(browser) {
  const context = await browser.newContext()
  await context.addInitScript(INIT_SCRIPT)
  const page = await context.newPage()
  try {
    await page.goto(BASE + '/projects', { waitUntil: 'domcontentloaded', timeout: 60000 })
    const href = await page.locator('a[href^="/projects/"]').first().getAttribute('href', { timeout: 15000 })
    return href
  } catch {
    return null
  } finally {
    await context.close()
  }
}

async function adminLogin(browser) {
  const email = process.env.MEASURE_ADMIN_EMAIL
  const password = process.env.MEASURE_ADMIN_PASSWORD
  if (!email || !password) return null
  const context = await browser.newContext()
  const page = await context.newPage()
  try {
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' })
    await page.locator('form input[name="email"]').first().fill(email)
    await page.locator('form input[name="password"]').first().fill(password)
    await page.locator('form button[type="submit"]').first().click()
    await page.waitForURL((u) => u.pathname.startsWith('/admin'), { timeout: 30000 })
    return await context.storageState()
  } catch (e) {
    console.warn('Admin login gagal, halaman admin dilewati:', e.message)
    return null
  } finally {
    await context.close()
  }
}

const kb = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : `${Math.round(b / 1024)} KB`)
const ms = (v) => (v == null ? '–' : `${(v / 1000).toFixed(2)} s`)

function toMarkdown(result) {
  const lines = []
  lines.push(`# Pengukuran gambar — ${result.label}`)
  lines.push('')
  lines.push(`- Waktu: ${result.date}`)
  lines.push(`- Target: ${result.base}`)
  lines.push(`- Cache browser dimatikan (cold load), intro loader dilewati, visitor tracking diblokir.`)
  lines.push(`- "Awal" = setelah load + jaringan idle tanpa scroll. "Penuh" = setelah scroll sampai bawah.`)
  lines.push('')
  for (const [key, profile] of Object.entries(PROFILES)) {
    const rows = result.pages.filter((p) => p.profile === key)
    if (!rows.length) continue
    lines.push(`## ${profile.label}`)
    lines.push('')
    lines.push('| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |')
    lines.push('|---|---|---|---|---|---|---|---|')
    for (const r of rows) {
      lines.push(
        `| \`${r.path}\`${r.error ? ' ⚠️' : ''} | ${ms(r.lcpMs)} | ${ms(r.aboveFoldImagesLoadedMs)} (${r.aboveFoldImages} img) | ${r.initial.count} / ${kb(r.initial.bytes)} | ${r.full.count} / ${kb(r.full.bytes)} | ${r.imgNotLazy}/${r.imgElements} | ${r.preloadImageLinks} | ${r.oversizedCount} |`
      )
    }
    lines.push('')
    lines.push('<details><summary>Detail LCP & file terbesar</summary>')
    lines.push('')
    for (const r of rows) {
      const l = r.lcpElement
      lines.push(`**\`${r.path}\`** — LCP: ${l ? `\`<${l.tag}>\` ${l.url ? l.url : `"${l.text}"`}` : '–'}${r.error ? ` — error: ${r.error}` : ''}`)
      for (const f of r.full.largest) lines.push(`- ${kb(f.bytes)} — ${f.url}`)
      if (r.oversizedWorst.length) {
        for (const o of r.oversizedWorst) lines.push(`- oversized ${o.ratio}×: natural ${o.naturalWidth}px, tampil ${o.renderedWidth}px — ${o.src}`)
      }
      lines.push('')
    }
    lines.push('</details>')
    lines.push('')
  }
  const cc = [...new Set(result.pages.flatMap((p) => p.full.cacheControl))]
  const ct = [...new Set(result.pages.flatMap((p) => p.full.contentTypes))]
  lines.push('## Header gambar yang terlihat')
  lines.push('')
  lines.push(`- Cache-Control: ${cc.map((c) => `\`${c}\``).join(', ') || '–'}`)
  lines.push(`- Content-Type: ${ct.map((c) => `\`${c}\``).join(', ') || '–'}`)
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const browser = await chromium.launch()
  const pages = []
  if (ONLY !== 'admin') {
    const detail = await findProjectDetailPath(browser)
    pages.push(...PUBLIC_PAGES, ...(detail ? [detail] : []))
  }
  const adminState = ONLY !== 'public' ? await adminLogin(browser) : null
  if (adminState) pages.push(...ADMIN_PAGES)
  if (!pages.length) throw new Error('Tidak ada halaman untuk diukur (cek kredensial admin).')

  const result = { label: LABEL, base: BASE, date: new Date().toISOString(), adminMeasured: !!adminState, pages: [] }
  for (const profileKey of Object.keys(PROFILES)) {
    for (const p of pages) {
      const isAdmin = p.startsWith('/admin')
      process.stdout.write(`[${profileKey}] ${p} ... `)
      const r = await measurePage(browser, profileKey, p, isAdmin ? adminState : undefined)
      result.pages.push(r)
      console.log(`LCP ${ms(r.lcpMs)}, gambar penuh ${r.full.count} req / ${kb(r.full.bytes)}${r.error ? ` (error: ${r.error})` : ''}`)
    }
  }
  await browser.close()

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, `${LABEL}.json`), JSON.stringify(result, null, 2) + '\n')
  fs.writeFileSync(path.join(OUT_DIR, `${LABEL}.md`), toMarkdown(result))
  console.log(`\nTersimpan: docs/perf/${LABEL}.json dan docs/perf/${LABEL}.md`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
