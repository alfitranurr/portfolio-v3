import { test, expect } from '@playwright/test'

/**
 * Integration test untuk /api/chat (src/app/api/chat/route.ts).
 * Mode: mock — GEMINI_API_KEY sengaja dikosongkan di playwright.config.ts
 *   agar kita bisa menguji jalur "not configured" tanpa biaya API.
 */

test.describe('/api/chat handler', () => {
  test('returns 400 when messages array is missing', async ({ request }) => {
    const res = await request.post('/api/chat', { data: {} })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/messages array is required/i)
  })

  test('returns 400 when messages array is empty', async ({ request }) => {
    const res = await request.post('/api/chat', { data: { messages: [] } })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/must not be empty/i)
  })

  test('returns 500 when GEMINI_API_KEY is not configured (mock mode)', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'Halo, siapa Al Fitra?' }],
      },
    })
    expect(res.status()).toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/AI service is not configured/i)
  })

  test('returns 400 when payload is not valid JSON object', async ({ request }) => {
    // Kirim raw body bukan JSON object
    const res = await request.post('/api/chat', {
      data: 'not-an-object',
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects GET method (405 or 404)', async ({ request }) => {
    const res = await request.get('/api/chat')
    // Next.js API route hanya mendeklarasikan POST; method lain biasanya 405.
    expect([404, 405]).toContain(res.status())
  })
})
