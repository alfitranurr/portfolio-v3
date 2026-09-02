import { test, expect, type APIRequestContext } from '@playwright/test'

/**
 * Middleware (src/proxy.ts → updateSession) bertugas:
 *  - /admin/* tanpa auth → redirect ke /login?redirectTo=...
 *  - /login dengan auth (mock_logged_in cookie) → redirect ke /admin
 *  - path publik tetap 200
 *
 * Test mode: mock (NEXT_PUBLIC_SUPABASE_URL kosong → hasSupabaseConfig false).
 * Autentikasi sepenuhnya via cookie `mock_logged_in=true`.
 */

test.describe('Middleware auth gate', () => {
  test('redirects unauthenticated /admin to /login', async ({ request }: { request: APIRequestContext }) => {
    // maxRedirects: 0 agar kita bisa inspect redirect awal
    const res = await request.get('/admin', { maxRedirects: 0 })
    expect(res.status()).toBeGreaterThanOrEqual(300)
    expect(res.status()).toBeLessThan(400)
    const loc = res.headers()['location']
    expect(loc).toBeTruthy()
    expect(loc).toContain('/login')
    expect(loc).toContain('redirectTo=')
    expect(loc).toContain(encodeURIComponent('/admin'))
  })

  test('allows /admin when mock_logged_in cookie is set', async ({ request }) => {
    const res = await request.get('/admin', {
      headers: { Cookie: 'mock_logged_in=true' },
      maxRedirects: 0,
    })
    // 200 (admin page render) atau 302 internal Next bila ada sub-route, tapi bukan redirect ke /login
    expect(res.status()).toBeLessThan(400)
    if (res.status() >= 300) {
      const loc = res.headers()['location'] || ''
      expect(loc).not.toContain('/login')
    }
  })

  test('redirects /login to /admin when already authenticated', async ({ request }) => {
    const res = await request.get('/login', {
      headers: { Cookie: 'mock_logged_in=true' },
      maxRedirects: 0,
    })
    expect(res.status()).toBeGreaterThanOrEqual(300)
    expect(res.status()).toBeLessThan(400)
    const loc = res.headers()['location']
    expect(loc).toContain('/admin')
  })

  test('public pages load without auth (home)', async ({ request }) => {
    const res = await request.get('/')
    expect(res.status()).toBe(200)
  })

  test('public pages load without auth (projects)', async ({ request }) => {
    const res = await request.get('/projects')
    expect(res.status()).toBe(200)
  })

  test('nested admin route also protected (/admin/projects)', async ({ request }) => {
    const res = await request.get('/admin/projects', { maxRedirects: 0 })
    expect(res.status()).toBeGreaterThanOrEqual(300)
    expect(res.headers()['location']).toContain('/login')
  })
})
