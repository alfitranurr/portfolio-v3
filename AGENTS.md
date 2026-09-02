<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, eslint.config.mjs). Run before committing.
- `npm run test` — Playwright integration tests (spins up dev server in mock mode on port 3111)
- `npm run test:ui` — interactive Playwright UI mode
- `npm run test:headed` — run tests in a visible browser
- `npm run test:report` — show last test report HTML

## Testing notes

- Tests live in `tests/*.spec.ts` and run via Playwright Test (`@playwright/test`).
- The Playwright webServer forces **mock mode** by clearing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` env vars (see `playwright.config.ts` `webServer.env`). This exercises the `hasSupabaseConfig() === false` fallback branches without needing real credentials.
- Mock admin credentials used in tests: `admin@portfolio.test` / `test-password-123` (set in `playwright.config.ts` `webServer.env`).
- Do NOT add a separate unit test framework — Playwright covers both API-level and UI-level integration tests.
<!-- END:commands-and-testing -->
