import { test, expect } from '@playwright/test'

/**
 * Setelah membuat item baru, daftar admin diperbarui lewat router.refresh()
 * — bukan window.location.reload() (docs/PERFORMANCE_OPTIMIZATION_PLAN.md Fase 3).
 */
test('creating an item refreshes the admin list without a full page reload', async ({ page }) => {
  test.setTimeout(90_000)
  await page.addInitScript(() => sessionStorage.setItem('has_loaded_intro', 'true'))

  await page.goto('/login')
  await page.fill('input[name="email"]', 'admin@portfolio.test')
  await page.fill('input[name="password"]', 'test-password-123')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/admin**', { timeout: 45000 })

  await page.goto('/admin/education')
  // Penanda di window hilang jika halaman di-reload penuh
  await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true))

  await page.getByRole('button', { name: /Add Education/ }).click()
  const institution = `Refresh Test University ${Date.now()}`
  await page.getByPlaceholder('e.g. University of Example').fill(institution)
  await page.getByPlaceholder('e.g. Bachelor of Science').fill('Bachelor of Testing')
  await page.locator('input[type="date"]').first().fill('2020-01-01')
  await page.locator('form button[type="submit"]').click()

  await expect(page.getByText(institution).first()).toBeVisible({ timeout: 20000 })
  expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true)
})
