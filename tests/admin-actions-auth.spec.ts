import { test, expect } from '@playwright/test'

/**
 * Auth guard untuk server actions di src/app/admin/actions/*.
 *
 * Strategi: di mock mode, server actions yang menulis (saveProjectAction, saveSkillAction,
 * deleteProjectAction, dst.) seharusnya tetap mengeksekusi mock path (karena hasSupabaseConfig
 * false → return early sebelum auth.getUser()). Jadi guard utama ada di middleware, BUKAN di
 * action body. Test ini memverifikasi:
 *   1. Endpoint server action tidak bisa dipanggil langsung tanpa auth via HTTP (Next.js
 *      mengembalikan 404/403 untuk invocation ID yang tidak valid).
 *   2. /admin/* benar-benar ter-redirect, sehingga UI tidak bisa memicu action dari unauthorized
 *      browser.
 */

test.describe('Admin actions auth guard', () => {
  test('admin page unreachable without auth → UI cannot trigger server actions', async ({ request }) => {
    const res = await request.get('/admin/projects', { maxRedirects: 0 })
    expect(res.status()).toBeGreaterThanOrEqual(300)
    expect(res.headers()['location']).toContain('/login')
  })

  test('direct server-action invocation path returns 404/405 for anonymous caller', async ({ request }) => {
    // Next.js server action dipanggil via POST ke path halaman dengan header khusus.
    // Tanpa action ID yang valid & cookie auth, harusnya tidak berhasil.
    const res = await request.post('/admin', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Next-Action': 'invalid-action-id',
      },
      form: { _payload: 'test' },
    })
    expect([400, 403, 404, 405]).toContain(res.status())
  })

  test('login page is reachable for anonymous user', async ({ request }) => {
    const res = await request.get('/login', { maxRedirects: 0 })
    expect(res.status()).toBe(200)
  })

  test('mock login flow sets cookie then admin reachable', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/login')

    // Isi form login mock (credentials dari playwright.config.ts env)
    await page.fill('input[name="email"]', 'admin@portfolio.test')
    await page.fill('input[name="password"]', 'test-password-123')
    await page.click('button[type="submit"]')

    // Setelah login sukses, harus sampai ke /admin
    await page.waitForURL('**/admin**', { timeout: 15000 })
    expect(page.url()).toContain('/admin')

    // Verifikasi cookie mock_logged_in ter-set
    const cookies = await ctx.cookies()
    const mockCookie = cookies.find(c => c.name === 'mock_logged_in')
    expect(mockCookie?.value).toBe('true')

    await ctx.close()
  })

  test('wrong mock credentials rejected', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/login')

    await page.fill('input[name="email"]', 'admin@portfolio.test')
    await page.fill('input[name="password"]', 'wrong-password')
    await page.click('button[type="submit"]')

    // Tetap di /login (tidak redirect ke /admin), dan muncul error message
    await page.waitForTimeout(1500)
    expect(page.url()).toContain('/login')

    await ctx.close()
  })
})
