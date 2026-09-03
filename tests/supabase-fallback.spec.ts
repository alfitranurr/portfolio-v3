import { test, expect } from '@playwright/test'

/**
 * Supabase fallback (src/lib/data-service.ts & src/lib/ai-service.ts):
 *   Saat NEXT_PUBLIC_SUPABASE_URL kosong / tidak valid → hasSupabaseConfig() false
 *   → semua getter mengembalikan MOCK_* data, dan writer memakai cookie.
 *
 * Mode test ini (playwright.config.ts) sengaja mengosongkan env, jadi seluruh
 * app seharusnya tetap hidup dan menampilkan data mock.
 */

test.describe('hasSupabaseConfig=false fallback', () => {
  test('home page renders with mock profile & projects', async ({ request }) => {
    const res = await request.get('/')
    expect(res.status()).toBe(200)
    const html = await res.text()
    // Mock profile headline
    expect(html).toContain('Data Enthusiast')
    // Salah satu mock project (lihat MOCK_PROJECTS di data-service.ts)
    expect(html).toContain('Predictive Customer Churn Pipeline')
  })

  test('projects page lists mock projects', async ({ request }) => {
    const res = await request.get('/projects')
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toContain('Computer Vision Traffic Classifier')
  })

  test('education page renders mock education', async ({ request }) => {
    const res = await request.get('/education')
    expect(res.status()).toBe(200)
    const html = await res.text()
    // MOCK_EDUCATION institution
    expect(html).toContain('State University of Indonesia')
  })

  test('certificates page renders mock certificates', async ({ request }) => {
    const res = await request.get('/certificates')
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toContain('BNSP')
  })

  test('ask-ai page loads (chat UI)', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/ask-ai')
    // Header SSR "Ask AI" selalu ada; greeting empty-state di-render setelah hydration
    // (di-belakang isHistoryLoaded guard), jadi tunggu hydration selesai.
    await expect(page.getByRole('heading', { name: 'Ask AI', exact: true })).toBeVisible()
    await page.waitForSelector('text=/Tanya apa saja tentang Al Fitra/i', {
      timeout: 15000,
    })
    await ctx.close()
  })

  test('AI chat logs fallback uses in-memory (no Supabase write)', async ({ request }) => {
    // Tanpa GEMINI_API_KEY, /api/chat mengembalikan 500 dengan pesan spesifik,
    // bukan error koneksi Supabase. Ini membuktikan getAISettings() memakai
    // default mock (cookie) dan tidak crash walau DB tidak ada.
    const res = await request.post('/api/chat', {
      data: { messages: [{ role: 'user', content: 'test' }] },
    })
    expect(res.status()).toBe(500)
    const body = await res.json()
    // Bukan error Supabase/network, melainkan pesan eksplisit tentang AI service
    expect(body.error).toMatch(/AI service is not configured/i)
  })

  test('visitor stats returns zeros in mock mode (admin reachable after login)', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Login mock dulu
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@portfolio.test')
    await page.fill('input[name="password"]', 'test-password-123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin**', { timeout: 15000 })

    // Admin page harus render dengan stats mock (0)
    const res = await page.request.get('/admin')
    expect(res.status()).toBe(200)
    const html = await res.text()
    // Visitor stats mock = 0 total views (lihat getVisitorStats mock branch)
    expect(html).toMatch(/0/)

    await ctx.close()
  })
})
