import { test, expect } from '@playwright/test'
import { availableWidths, parseVariantUrl, pickVariantWidth, variantUrl } from '../src/lib/image-variants'

/**
 * Pipeline gambar responsif (docs/PERFORMANCE_OPTIMIZATION_PLAN.md Fase 1):
 *   - custom loader memetakan lebar srcset ke varian yang dibuat saat upload
 *   - gambar di luar layar lazy, preload hanya untuk gambar prioritas
 *   - upload admin me-resize ke maks. 2560px WebP di browser sebelum dikirim
 */

const SUPA = 'https://abc.supabase.co/storage/v1/object/public/portfolio-assets'

test.describe('image variants (pure)', () => {
  test('parses variant URL and picks nearest larger variant', () => {
    const url = `${SUPA}/opt/project-cover-1783969421916/w2560.webp`
    expect(parseVariantUrl(url)).toEqual({ base: `${SUPA}/opt/project-cover-1783969421916/`, max: 2560, ext: 'webp' })
    expect(variantUrl(url, 100)).toBe(`${SUPA}/opt/project-cover-1783969421916/w128.webp`)
    expect(variantUrl(url, 700)).toBe(`${SUPA}/opt/project-cover-1783969421916/w960.webp`)
    expect(variantUrl(url, 1000)).toBe(`${SUPA}/opt/project-cover-1783969421916/w1280.webp`)
    expect(variantUrl(url, 3840)).toBe(url)
  })

  test('never requests a variant larger than the stored max', () => {
    expect(availableWidths(900)).toEqual([128, 256, 640, 900])
    expect(pickVariantWidth(900, 1080)).toBe(900)
    expect(variantUrl(`${SUPA}/opt/edu-logo-1779474595374/w500.jpg`, 640)).toBe(`${SUPA}/opt/edu-logo-1779474595374/w500.jpg`)
  })

  test('maps Google Drive / lh3 / Unsplash widths and leaves other URLs untouched', () => {
    expect(variantUrl('https://drive.google.com/file/d/AbC_123/view', 640)).toBe('https://lh3.googleusercontent.com/d/AbC_123=w640-rj-l90')
    expect(variantUrl('https://lh3.googleusercontent.com/d/AbC_123=w1000', 256)).toBe('https://lh3.googleusercontent.com/d/AbC_123=w256-rj-l90')
    expect(variantUrl('https://lh3.googleusercontent.com/d/AbC_123=w640-rj-l90', 960)).toBe('https://lh3.googleusercontent.com/d/AbC_123=w960-rj-l90')
    expect(variantUrl('https://images.unsplash.com/photo-1?auto=format&w=600&q=80', 1080)).toContain('w=1080')
    const legacy = `${SUPA}/project-cover-1779959848298.png`
    expect(variantUrl(legacy, 640)).toBe(legacy)
  })
})

test.describe('image rendering', () => {
  test('home Moment Recap photos use responsive srcset and lazy loading', async ({ page }) => {
    await page.goto('/')
    const img = page.locator('img[src*="images.unsplash.com"]').first()
    await expect(img).toBeAttached()
    const srcset = (await img.getAttribute('srcset')) || ''
    const widths = [...srcset.matchAll(/[?&]w=(\d+)/g)].map((m) => m[1])
    expect(new Set(widths).size).toBeGreaterThan(1)
    await expect(img).toHaveAttribute('loading', 'lazy')
  })

  test('card hover zoom animates the CSS scale property smoothly', async ({ page }) => {
    // Tailwind v4 `group-hover:scale-*` menulis properti `scale` — harus ikut ditransisikan
    await page.goto('/')
    const img = page.locator('img[src*="images.unsplash.com"]').first()
    await expect(img).toBeAttached()
    const t = await img.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { property: cs.transitionProperty, duration: cs.transitionDuration }
    })
    const props = t.property.split(',').map((p) => p.trim())
    const durations = t.duration.split(',').map((d) => parseFloat(d))
    const scaleIdx = props.indexOf('scale')
    expect(scaleIdx).toBeGreaterThanOrEqual(0)
    expect(durations[scaleIdx]).toBeGreaterThanOrEqual(0.6)
  })

  test('certificates page does not preload every card image', async ({ page }) => {
    await page.goto('/certificates')
    const preloads = await page.locator('link[rel="preload"][as="image"]').count()
    expect(preloads).toBeLessThanOrEqual(6)
  })
})

test.describe('admin image upload (mock mode)', () => {
  test('large image is resized to a 2560px WebP before upload', async ({ page }) => {
    // Kompilasi pertama /admin di dev server bisa lambat
    test.setTimeout(90_000)
    // Lewati intro loader (overlay fullscreen yang menutupi tombol)
    await page.addInitScript(() => sessionStorage.setItem('has_loaded_intro', 'true'))

    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@portfolio.test')
    await page.fill('input[name="password"]', 'test-password-123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin**', { timeout: 45000 })

    await page.goto('/admin/photos')
    await page.getByRole('button', { name: /Add Photo/ }).click()

    // PNG 3200×1800 dibuat di browser agar test tidak butuh fixture biner
    const base64 = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 3200
      c.height = 1800
      const ctx = c.getContext('2d')!
      const g = ctx.createLinearGradient(0, 0, 3200, 1800)
      g.addColorStop(0, '#0ea5e9')
      g.addColorStop(1, '#f97316')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 3200, 1800)
      return c.toDataURL('image/png').split(',')[1]
    })
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'big-photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(base64, 'base64'),
    })

    const preview = page.locator('img[alt="Photo preview"]')
    await expect(preview).toHaveAttribute('src', /^data:image\/webp;base64,/, { timeout: 30000 })
    await expect.poll(() => preview.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(2560)
  })
})
