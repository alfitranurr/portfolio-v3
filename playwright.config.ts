import { defineConfig, devices } from '@playwright/test'

const PORT_MOCK = 3111

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  expect: { timeout: 10000 },

  use: {
    baseURL: `http://localhost:${PORT_MOCK}`,
    trace: 'on-first-retry',
    extraHTTPHeaders: { 'X-Test-Run': 'playwright' },
  },

  projects: [
    {
      name: 'mock-mode',
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        storageState: { cookies: [], origins: [] },
        // Fallback: pakai chromium-1234 (headed build) karena headless_shell-1234
        // belum ter-install (playwright install timeout koneksi lambat).
        launchOptions: {
          executablePath:
            'C:\\Users\\HYPE-R FLIP\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
        },
      },
    },
  ],

  webServer: {
    command: `next dev --port ${PORT_MOCK}`,
    url: `http://localhost:${PORT_MOCK}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Force mock mode: no Supabase config, no Gemini key.
      // Ini memicu branch hasSupabaseConfig() === false di seluruh codebase.
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      GEMINI_API_KEY: '',
      ADMIN_MOCK_EMAIL: 'admin@portfolio.test',
      ADMIN_MOCK_PASSWORD: 'test-password-123',
    },
  },
})
