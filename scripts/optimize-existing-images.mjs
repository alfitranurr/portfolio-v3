// Migrasi gambar lama di bucket `portfolio-assets` ke varian WebP responsif
// (docs/PERFORMANCE_OPTIMIZATION_PLAN.md — Fase 2). Aturan varian sama persis dengan
// upload admin karena diimpor langsung dari src/lib/image-variants.ts.
//
// Pemakaian (PowerShell):
//   (tambahkan --disable-warning=MODULE_TYPELESS_PACKAGE_JSON setelah `node` untuk menyembunyikan warning impor .ts)
//   node --env-file=.env.local scripts/optimize-existing-images.mjs                 # dry-run (tidak menulis apa pun)
//   node --env-file=.env.local scripts/optimize-existing-images.mjs --out .tmp/variants   # dry-run + simpan varian lokal untuk dicek visual
//   $env:MIGRATE_ADMIN_EMAIL="..."; $env:MIGRATE_ADMIN_PASSWORD="..."
//   node --env-file=.env.local scripts/optimize-existing-images.mjs --apply         # upload varian + update DB
//   node --env-file=.env.local scripts/optimize-existing-images.mjs --rollback scripts/migration-reports/<file>.json
//
// Keamanan:
// - Login sebagai admin (anon key + email/password) sehingga tetap tunduk pada RLS; tidak butuh service role key.
// - File asli TIDAK dihapus. Setiap --apply menulis laporan JSON (oldUrl → newUrl per baris) untuk --rollback.
// - Update DB memakai filter `id` + nilai lama, jadi baris yang sudah diubah orang lain tidak tertimpa.

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import {
  MAX_IMAGE_WIDTH,
  STORAGE_BUCKET,
  VARIANT_DIR,
  availableWidths,
  variantPath,
} from '../src/lib/image-variants.ts'

const CACHE_CONTROL = '31536000'
const WEBP_QUALITY = 90
const REPORT_DIR = path.resolve('scripts/migration-reports')

const TARGETS = [
  { table: 'profiles', column: 'avatar_url' },
  { table: 'profiles', column: 'logo_url' },
  { table: 'projects', column: 'cover_image' },
  { table: 'projects', column: 'content', markdown: true },
  { table: 'experiences', column: 'logo_url' },
  { table: 'education', column: 'logo_url' },
  { table: 'certificates', column: 'image_url' },
  { table: 'skills', column: 'logo_url' },
  { table: 'photos', column: 'image_url' },
]

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const opt = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const APPLY = flag('apply')
const ROLLBACK = opt('rollback')
const OUT_DIR = opt('out')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !ANON_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum di-set (jalankan dengan --env-file=.env.local).')
  process.exit(1)
}

const PUBLIC_PREFIX = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${STORAGE_BUCKET}/`
const URL_IN_TEXT_RE = new RegExp(`${PUBLIC_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\s)"'<>\\]]+`, 'g')
const SKIP_EXT = new Set(['svg', 'gif', 'ico'])

const kb = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : `${Math.round(b / 1024)} KB`)

const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })

async function signInAdmin() {
  const email = process.env.MIGRATE_ADMIN_EMAIL
  const password = process.env.MIGRATE_ADMIN_PASSWORD
  if (!email || !password) {
    console.error('Set MIGRATE_ADMIN_EMAIL & MIGRATE_ADMIN_PASSWORD untuk --apply / --rollback.')
    process.exit(1)
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('Login admin gagal:', error.message)
    process.exit(1)
  }
}

/** Path objek relatif terhadap bucket, atau null jika bukan kandidat migrasi. */
function eligiblePath(url) {
  if (typeof url !== 'string' || !url.startsWith(PUBLIC_PREFIX)) return null
  const objectPath = decodeURIComponent(url.slice(PUBLIC_PREFIX.length).split('?')[0])
  if (objectPath.startsWith(`${VARIANT_DIR}/`)) return null
  const ext = (objectPath.split('.').pop() || '').toLowerCase()
  if (SKIP_EXT.has(ext)) return null
  return objectPath
}

function variantKey(objectPath) {
  const base = path.posix.basename(objectPath).replace(/\.[^.]+$/, '')
  return base.replace(/[^a-zA-Z0-9_-]/g, '-')
}

async function collectReferences() {
  /** @type {Map<string, {objectPath: string, refs: {table: string, column: string, id: string, markdown?: boolean}[]}>} */
  const byUrl = new Map()
  const skipped = []
  const add = (url, ref) => {
    const objectPath = eligiblePath(url)
    if (!objectPath) {
      if (typeof url === 'string' && url.startsWith(PUBLIC_PREFIX) && !url.includes(`/${VARIANT_DIR}/`)) skipped.push({ url, ...ref })
      return
    }
    if (!byUrl.has(url)) byUrl.set(url, { objectPath, refs: [] })
    byUrl.get(url).refs.push(ref)
  }

  for (const t of TARGETS) {
    const { data, error } = await supabase.from(t.table).select(`id, ${t.column}`)
    if (error) {
      console.warn(`  ! ${t.table}.${t.column}: ${error.message} (dilewati)`)
      continue
    }
    for (const row of data) {
      const value = row[t.column]
      if (!value) continue
      if (t.markdown) {
        for (const url of new Set(String(value).match(URL_IN_TEXT_RE) || [])) {
          add(url, { table: t.table, column: t.column, id: row.id, markdown: true })
        }
      } else {
        add(value, { table: t.table, column: t.column, id: row.id })
      }
    }
  }
  return { byUrl, skipped }
}

/**
 * Encode satu varian. Untuk sumber PNG / transparan dicoba lossy q90, near-lossless dan
 * lossless, lalu diambil yang terkecil (lossless = kualitas identik, jadi aman dipilih).
 * Untuk foto (JPEG/WebP lossy) cukup lossy q90 + smartSubsample.
 */
async function encodeVariant(buffer, width, graphic) {
  const resized = () => sharp(buffer, { failOn: 'none', animated: false }).rotate().resize({ width, withoutEnlargement: true })
  const candidates = [
    { mode: 'lossy', buffer: await resized().webp({ quality: WEBP_QUALITY, effort: 5, smartSubsample: true, alphaQuality: 100 }).toBuffer() },
  ]
  if (graphic) {
    candidates.push({ mode: 'near-lossless', buffer: await resized().webp({ nearLossless: true, quality: WEBP_QUALITY, effort: 5 }).toBuffer() })
    candidates.push({ mode: 'lossless', buffer: await resized().webp({ lossless: true, effort: 5 }).toBuffer() })
  }
  return candidates.sort((x, y) => x.buffer.length - y.buffer.length)[0]
}

async function buildVariants(buffer) {
  const meta = await sharp(buffer, { failOn: 'none', animated: false }).metadata()
  if ((meta.pages ?? 1) > 1) return { skip: 'animated image' }
  const width = meta.autoOrient?.width ?? meta.width
  if (!width) return { skip: 'unknown dimensions' }

  const maxWidth = Math.min(width, MAX_IMAGE_WIDTH)
  // Grafis (PNG / ada transparansi): logo, ikon, screenshot — coba juga encoding lossless
  const graphic = meta.format === 'png' || !!meta.hasAlpha
  const variants = []
  for (const w of availableWidths(maxWidth)) {
    const { mode, buffer: out } = await encodeVariant(buffer, w, graphic)
    variants.push({ width: w, buffer: out, mode })
  }
  return { width, height: meta.autoOrient?.height ?? meta.height, format: meta.format, maxWidth, graphic, variants }
}

async function migrate() {
  if (APPLY) await signInAdmin()
  console.log(`Mode: ${APPLY ? 'APPLY (menulis ke Supabase)' : 'DRY-RUN (tidak menulis apa pun)'}\n`)

  const { byUrl, skipped } = await collectReferences()
  console.log(`Kandidat: ${byUrl.size} file unik, ${[...byUrl.values()].reduce((s, v) => s + v.refs.length, 0)} referensi DB`)
  if (skipped.length) console.log(`Dilewati (SVG/GIF/ICO): ${skipped.length}`)
  console.log('')

  const items = []
  let totalOriginal = 0
  let totalLargest = 0
  for (const [oldUrl, { objectPath, refs }] of byUrl) {
    const key = variantKey(objectPath)
    process.stdout.write(`• ${objectPath} `)
    const res = await fetch(oldUrl)
    if (!res.ok) {
      console.log(`→ GAGAL download (${res.status})`)
      items.push({ oldUrl, refs, error: `download ${res.status}` })
      continue
    }
    const original = Buffer.from(await res.arrayBuffer())
    const built = await buildVariants(original)
    if (built.skip) {
      console.log(`→ dilewati (${built.skip})`)
      items.push({ oldUrl, refs, skipped: built.skip })
      continue
    }
    const largest = built.variants.at(-1)
    const newUrl = `${PUBLIC_PREFIX}${variantPath(key, largest.width, 'webp')}`
    totalOriginal += original.length
    totalLargest += largest.buffer.length
    console.log(
      `${built.format} ${built.width}px ${kb(original.length)} → w${largest.width}.webp ${kb(largest.buffer.length)}` +
        ` (${built.variants.map((v) => `w${v.width}:${kb(v.buffer.length)}${v.mode === 'lossy' ? '' : `[${v.mode}]`}`).join(' ')})` +
        ` · ${refs.length} ref`
    )

    if (OUT_DIR) {
      const dir = path.resolve(OUT_DIR, key)
      fs.mkdirSync(dir, { recursive: true })
      for (const v of built.variants) fs.writeFileSync(path.join(dir, `w${v.width}.webp`), v.buffer)
    }

    const item = {
      oldUrl,
      newUrl,
      variantFolder: key,
      originalBytes: original.length,
      source: { format: built.format, width: built.width, height: built.height },
      variants: Object.fromEntries(built.variants.map((v) => [v.width, { bytes: v.buffer.length, mode: v.mode }])),
      refs,
    }

    if (APPLY) {
      const storage = supabase.storage.from(STORAGE_BUCKET)
      for (const v of built.variants) {
        const { error } = await storage.upload(variantPath(key, v.width, 'webp'), v.buffer, {
          contentType: 'image/webp',
          cacheControl: CACHE_CONTROL,
          upsert: true,
        })
        if (error) throw new Error(`Upload ${key}/w${v.width} gagal: ${error.message}`)
      }
      const head = await fetch(newUrl, { method: 'HEAD' })
      if (!head.ok) throw new Error(`Varian terbesar tidak bisa diakses (${head.status}): ${newUrl}`)
      item.uploaded = true
    }
    items.push(item)
  }

  console.log(`\nTotal file asli: ${kb(totalOriginal)} → varian terbesar: ${kb(totalLargest)}` +
    (totalOriginal ? ` (−${Math.round((1 - totalLargest / totalOriginal) * 100)}%)` : ''))
  console.log('(Browser biasanya mengunduh varian yang lebih kecil lagi sesuai ukuran tampilan.)')

  if (!APPLY) {
    console.log('\nDRY-RUN selesai. Tidak ada yang diubah. Jalankan dengan --apply untuk eksekusi.')
    return
  }

  // Update DB setelah semua varian terupload. Laporan selalu ditulis (finally) agar bisa di-rollback
  const updates = []
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const reportPath = path.join(REPORT_DIR, `migration-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  const writeReport = () =>
    fs.writeFileSync(reportPath, JSON.stringify({ date: new Date().toISOString(), supabaseUrl: SUPABASE_URL, items, updates }, null, 2) + '\n')
  try {
    const ready = items.filter((i) => i.uploaded)
    const urlMap = new Map(ready.map((i) => [i.oldUrl, i.newUrl]))
    const markdownRows = new Map()
    for (const item of ready) {
      for (const ref of item.refs) {
        if (ref.markdown) {
          markdownRows.set(`${ref.table}|${ref.column}|${ref.id}`, ref)
          continue
        }
        const { data, error } = await supabase
          .from(ref.table)
          .update({ [ref.column]: item.newUrl })
          .eq('id', ref.id)
          .eq(ref.column, item.oldUrl)
          .select('id')
        if (error) throw new Error(`Update ${ref.table}.${ref.column} id=${ref.id} gagal: ${error.message}`)
        updates.push({ ...ref, oldValue: item.oldUrl, newValue: item.newUrl, updated: data.length })
      }
    }
    for (const ref of markdownRows.values()) {
      const { data: row, error } = await supabase.from(ref.table).select(ref.column).eq('id', ref.id).single()
      if (error) throw new Error(`Baca ${ref.table}.${ref.column} id=${ref.id} gagal: ${error.message}`)
      const oldValue = row[ref.column]
      const newValue = oldValue.replace(URL_IN_TEXT_RE, (u) => urlMap.get(u) ?? u)
      if (newValue === oldValue) continue
      const { data, error: upErr } = await supabase
        .from(ref.table)
        .update({ [ref.column]: newValue })
        .eq('id', ref.id)
        .eq(ref.column, oldValue)
        .select('id')
      if (upErr) throw new Error(`Update ${ref.table}.${ref.column} id=${ref.id} gagal: ${upErr.message}`)
      updates.push({ ...ref, oldValue, newValue, updated: data.length })
    }
  } finally {
    writeReport()
  }

  const ok = updates.filter((u) => u.updated > 0).length
  const notUpdated = updates.filter((u) => u.updated === 0)
  console.log(`\nDB: ${ok} baris diperbarui${notUpdated.length ? `, ${notUpdated.length} tidak cocok (nilai sudah berubah / RLS)` : ''}.`)
  for (const u of notUpdated) console.log(`  ! ${u.table}.${u.column} id=${u.id}`)
  console.log(`Laporan: ${path.relative(process.cwd(), reportPath)}`)
  console.log('Langkah berikutnya: buka /admin → "Revalidate public pages" agar halaman ISR memakai URL baru.')
}

async function rollback(file) {
  await signInAdmin()
  const report = JSON.parse(fs.readFileSync(file, 'utf8'))
  let restored = 0
  for (const u of report.updates.filter((x) => x.updated > 0)) {
    const { data, error } = await supabase
      .from(u.table)
      .update({ [u.column]: u.oldValue })
      .eq('id', u.id)
      .eq(u.column, u.newValue)
      .select('id')
    if (error) {
      console.log(`  ! ${u.table}.${u.column} id=${u.id}: ${error.message}`)
      continue
    }
    if (data.length) restored++
    else console.log(`  ! ${u.table}.${u.column} id=${u.id}: nilai sudah berubah sejak migrasi, dilewati`)
  }
  console.log(`Rollback: ${restored} baris dikembalikan ke URL asli. File varian di opt/ tidak dihapus.`)
}

;(ROLLBACK ? rollback(ROLLBACK) : migrate()).catch((err) => {
  console.error('\nERROR:', err.message)
  process.exit(1)
})
