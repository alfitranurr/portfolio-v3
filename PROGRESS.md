# Laporan Progres Refactor Codebase — portfolio-v3

> Dokumen ini mencatat semua perbaikan yang sudah dilakukan, yang masih kurang, dan status terkini, agar bisa dilanjutkan di sesi berikutnya.

Tanggal mulai: 2026-09-01
Status: **SELESAI** — semua 6 perbaikan selesai. Test 23/23 pass, lint 0/0, typecheck lolos, build sukses.

---

## Ringkasan Skor Awal → Target

| Kategori | Awal | Target | Status |
|---|---|---|---|
| Arsitektur & Struktur | 8.5/10 | 9/10 | ✅ Selesai (no 3) |
| Type Safety | 6.5/10 | 9/10 | ✅ Selesai (no 2) |
| Keamanan | 7/10 | 9/10 | ✅ Selesai (no 5) |
| Error Handling | 8/10 | 9/10 | ✅ Selesai (no 2) |
| Maintainability | 7/10 | 9/10 | ✅ Selesai (no 3) |
| Code Style | 7.5/10 | 10/10 | ✅ Selesai (no 2) |
| Dokumentasi | 9/10 | 9/10 | ✅ Bertahan |
| Performa | 8/10 | 8/10 | ✅ Bertahan |
| RAG/AI | 8.5/10 | 8.5/10 | ✅ Bertahan |
| **Skor Akhir (estimasi)** | **7.5/10** | **~9/10** | ✅ Tercapai |

---

## Daftar Perbaikan (Urutan Rekomendasi Awal)

### ✅ No 1 — Fix Bug Rules-of-Hooks di ProjectForm.tsx
**Status: SELESAI**

**Masalah:**
- `React.useMemo` dipanggil **setelah** early return `if (!project) return null` di `src/components/admin/projects/ProjectForm.tsx:33-38`.
- Ini melanggar Rules of Hooks — bisa crash saat runtime.

**Perbaikan:**
- Pindahkan `useMemo` sebelum early return.
- Gabungkan logika `currentCategory` & `subCategoryOptions` ke dalam `useMemo` dengan guard `if (!project) return []`.
- Hapus deklarasi duplikat di luar.

**File berubah:**
- `src/components/admin/projects/ProjectForm.tsx`

**Verifikasi:** `npx eslint src/components/admin/projects/ProjectForm.tsx` → 0 error, 0 warning.

---

### ✅ No 2 — Bersihkan Lint (64 masalah → 0)
**Status: SELESAI**

**Masalah:**
- 35 errors + 30 warnings = 64 masalah lint.
- Dominan: `@typescript-eslint/no-explicit-any`, unused imports, unescaped entities, `<img>` vs `next/image`.

**Perbaikan:**

**A. Auto-fix (3 errors):**
- `npx eslint . --fix` untuk `prefer-const` di `data-service.ts:712-718`.

**B. Unused imports/vars (dihapus):**
| File | Yang dihapus |
|---|---|
| `ExperienceTableView.tsx` | `Calendar`, `MapPin` |
| `ExperienceControls.tsx` | `AnimatePresence` |
| `ExperienceForm.tsx` | `DEFAULT_EXPERIENCE` |
| `PhotoGridView.tsx` | `ImageIcon` |
| `PhotoTableView.tsx` | `ImageIcon` |
| `PhotosControls.tsx` | `motion`, `AnimatePresence`, `ImageIcon`, `Sparkles` |
| `CertificateControls.tsx` | `AnimatePresence` |
| `CertificateForm.tsx` | `Calendar`, `ExternalLink`, `cn` |
| `CertificateTableView.tsx` | `Calendar` |
| `EducationTableView.tsx` | `Calendar`, `MapPin` |
| `SkillForm.tsx` | `cn` |
| `SkillsControls.tsx` | `AnimatePresence` |
| `journey-marquee.tsx` | `cn` |
| `messages/index.tsx` | `Clock`, `handleResetAnalytics`, `resetVisitorAnalyticsAction` import |

**C. Dead code dihapus:**
- `handleDuplicate` function + `onDuplicate` prop di `SkillGridView.tsx` & `SkillTableView.tsx` (di-passing tapi tidak pernah dipanggil di body).

**D. Unescaped entities:**
- `messages/index.tsx:51,55`: `Today's` → `{"Today's"}` (JSX expression).
- `ExperienceForm.tsx:277`: `"Add Bullet"` → `{"Add Bullet"}`.

**E. `any` → `unknown` (Type Safety):**

**`src/lib/ai-service.ts` (11 errors):**
- Semua `catch (e: any)` → `catch (e: unknown)` + `e instanceof Error ? e.message : String(e)`.
- Callback `(a: any, b: any)` → typed inline.
- `let inMemoryLogs` callback sort tetap typed.

**`src/lib/data-service.ts` (15 errors):**
- Tambah 2 helper function di atas file:
  ```ts
  function isDynamicServerError(e: unknown): boolean {
    if (typeof e !== 'object' || e === null) return false
    const err = e as { digest?: string; message?: string }
    return err.digest === 'DYNAMIC_SERVER_USAGE' ||
           (err.message?.includes('Dynamic server usage') ?? false)
  }

  function hasPostgresTableMissingError(e: unknown): boolean {
    if (typeof e !== 'object' || e === null) return false
    const err = e as { code?: string; message?: string }
    return err.code === '42883' || err.code === '42P01' ||
           (err.message?.includes('does not exist') ?? false)
  }
  ```
- Semua `catch (e: any)` dengan pattern `e?.digest`/`e?.message` → `catch (e: unknown)` + `isDynamicServerError(e)`.
- `catch (err: any)` → `catch (err: unknown)`.
- Callback `(row: any)` → typed inline:
  - `(row: { month_num: number; views_count: number; visitors_count: number })`
  - `(row: { year_val: number })`
- Pattern `err?.code === '42883'...` → `hasPostgresTableMissingError(err)`.

**`src/app/contact/actions.ts` (2 errors):**
- `prevState: any` → `prevState: unknown`.
- `catch (err: any)` → `catch (err: unknown)`.

**`src/app/login/actions.ts` (5 errors, 2 warnings):**
- `prevState: any` → `prevState: unknown` (loginAction & signupAction).
- `catch (err: any)` → `catch` (tidak terpakai).

**F. `<img>` → `next/image`:**
- `skills-marquee.tsx:30`: `<img>` → `<Image>` dengan `width={24} height={24} unoptimized`.
- Tambah `import Image from 'next/image'`.

**G. Parameter tidak terpakai:**
- `utils.ts:18`: `formatDuration(startDateStr, endDateStr, isCurrent: boolean = false)` — `isCurrent` tidak pernah dipakai di body.
- Hapus parameter + update 4 caller:
  - `experience-filter-list.tsx:228, 315, 354`
  - `education/page.tsx:64`

**Verifikasi:**
- `npx eslint .` → 0 error, 0 warning ✅
- `npx tsc --noEmit` → lolos ✅

---

### ✅ No 3 — Pecah `actions.ts` (1729 baris → 11 modul)
**Status: SELESAI**

**Masalah:**
- `src/app/admin/actions.ts` 1729 baris berisi semua server actions (profile, projects, education, experience, certificates, skills, photos, messages, AI, analytics, uploads).
- God file, sulit maintain.

**Strategi:**
- Buat folder `src/app/admin/actions/` dengan 1 file per-domain.
- `actions.ts` diubah jadi **barrel re-export** (11 baris) agar 17 importers tidak perlu diubah (zero-churn migration).

**Struktur baru:**
```
src/app/admin/
├── actions.ts              # barrel re-export (11 baris)
└── actions/
    ├── _shared.ts          # hasSupabaseConfig() helper
    ├── messages.ts         # getMessagesAction, toggleMessageReadAction, deleteMessageAction
    ├── profile.ts          # updateProfileAction
    ├── projects.ts         # saveProjectAction, deleteProjectAction, updateProjectsOrderAction, updateFeaturedProjectsOrderAction
    ├── education.ts        # saveEducationAction, deleteEducationAction
    ├── experience.ts       # saveExperienceAction, deleteExperienceAction
    ├── certificates.ts     # saveCertificateAction, deleteCertificateAction
    ├── uploads.ts          # uploadAssetAction
    ├── ai.ts               # getAISettingsAction, saveAISettingsAction, getAIChatLogsAction, clearAIChatLogsAction
    ├── skills.ts           # saveSkillAction, deleteSkillAction, updateSkillsTextAction
    ├── analytics.ts        # trackPageViewAction, getVisitorStatsAction, resetVisitorAnalyticsAction, getMonthlyVisitorStatsAction, getAvailableYearsAction
    └── photos.ts           # savePhotoAction, deletePhotoAction
```

**Isi barrel (`actions.ts`):**
```ts
export * from './actions/messages'
export * from './actions/profile'
export * from './actions/projects'
// ... (11 modul)
```

**Catatan:**
- `hasSupabaseConfig()` dipindah ke `_shared.ts` dan di-import oleh semua modul.
- Semua 17 importers (`from '@/app/admin/actions'`) tetap berfungsi tanpa perubahan.

**Verifikasi:**
- `npx eslint .` → 0 error ✅
- `npx tsc --noEmit` → lolos ✅
- `npm run build` → sukses, 34 route terkompilasi ✅

---

### ✅ No 4 — `.gitignore` untuk `mock-ai-logs.json`
**Status: SELESAI**

**Masalah:**
- `src/lib/ai-service.ts:42` menulis file `mock-ai-logs.json` ke `src/lib/` saat mock mode.
- Berisiko ter-commit kalau developer jalankan app tanpa Supabase lalu `git add .`.

**Perbaikan:**
Tambah entry di `.gitignore`:
```
# mock generated data (written by ai-service.ts when running without Supabase)
src/lib/mock-ai-logs.json

# playwright
/test-results/
/playwright-report/
/playwright/.cache/
```

**Verifikasi:**
- `git check-ignore -v src/lib/mock-ai-logs.json` → ter-ignore ✅

---

### ✅ No 5 — Integration Test dengan Playwright
**Status: SELESAI (23/23 pass)**

**Masalah:**
- Nol file test. Portfolio dengan AI + auth + admin CRUD sebaiknya punya smoke test.

**Yang sudah dilakukan:**

1. **Install dependency:**
   ```
   npm install -D @playwright/test
   ```

2. **Buat `playwright.config.ts`:**
   - Test dir: `./tests`
   - Port: 3111
   - **Mock mode** — `webServer.env` mengosongkan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY` agar `hasSupabaseConfig() === false`.
   - Mock admin credentials: `admin@portfolio.test` / `test-password-123`.
   - Browser: Desktop Chrome (chromium).

3. **Buat 4 file test (25 test cases total):**

   **`tests/middleware-auth.spec.ts`** (6 tests):
   - Redirect unauthenticated `/admin` → `/login?redirectTo=...`
   - Allow `/admin` dengan cookie `mock_logged_in=true`
   - Redirect `/login` → `/admin` saat sudah authenticated
   - Public pages (`/`, `/projects`) 200 tanpa auth
   - Nested admin route (`/admin/projects`) juga terproteksi

   **`tests/api-chat.spec.ts`** (5 tests):
   - 400 saat `messages` array missing
   - 400 saat `messages` array kosong
   - 500 saat `GEMINI_API_KEY` tidak configured
   - 400 saat payload bukan JSON object valid
   - GET method ditolak (404/405)

   **`tests/admin-actions-auth.spec.ts`** (5 tests):
   - Admin page unreachable → UI tidak bisa trigger server actions
   - Direct server-action invocation path returns 400/403/404/405
   - `/login` reachable untuk anonymous
   - Mock login flow → set cookie → `/admin` reachable
   - Wrong credentials → tetap di `/login`

   **`tests/supabase-fallback.spec.ts`** (7 tests):
   - Home page render mock profile & projects
   - Projects page list mock projects
   - Education page render mock education
   - Certificates page render mock certificates
   - `/ask-ai` load chat UI
   - AI chat logs fallback pakai in-memory (no Supabase write)
   - Visitor stats returns zeros di mock mode

4. **Update `package.json` scripts:**
   ```json
   "test": "playwright test",
   "test:ui": "playwright test --ui",
   "test:headed": "playwright test --headed",
   "test:report": "playwright show-report"
   ```

5. **Update `AGENTS.md`** dengan section Commands & Testing notes.

6. **Update `.gitignore`** untuk `test-results/`, `playwright-report/`, `playwright/.cache/`.

**Hasil eksekusi pertama: 14 passed / 9 failed**

| # | Test | Status | Penyebab Failure |
|---|---|---|---|
| 1-6 | middleware-auth (semua) | ✅ PASS | — |
| 2 | api-chat: 400 missing messages | ❌ FAIL | Status code tidak sesuai — perlu investigasi |
| 3 | api-chat: 400 empty messages | ❌ FAIL | Sama |
| 4 | api-chat: 500 no GEMINI_API_KEY | ❌ FAIL | Dapat 404 bukan 500 — mungkin routing issue |
| 5 | api-chat: 400 invalid payload | ❌ FAIL | Sama |
| 6 | api-chat: GET 404/405 | ✅ PASS | — |
| 7 | admin-actions-auth: mock login flow | ❌ FAIL | Browser binary tidak ada |
| 8 | admin-actions-auth: wrong credentials | ❌ FAIL | Browser binary tidak ada |
| 9 | supabase-fallback: ask-ai page loads | ❌ FAIL | Text "Tanya apa saja" tidak ada di SSR HTML (client-rendered) |
| 10 | supabase-fallback: AI chat logs fallback | ❌ FAIL | `/api/chat` return 404 |
| 11 | supabase-fallback: visitor stats | ❌ FAIL | Browser binary tidak ada |

**Root cause failures (3 masalah) — semua sudah di-fix:**

1. **Browser binary `chromium_headless_shell-1234` hilang** → set `executablePath` eksplisit ke `chromium-1234/chrome-win64/chrome.exe` di `playwright.config.ts` `projects[0].use.launchOptions`.
2. **`/api/chat` return 404/500 salah urutan** → reorder `src/app/api/chat/route.ts`: validasi `messages` (400) **sebelum** cek `GEMINI_API_KEY` (500). Tambah safe JSON parse yang return 400 jika body bukan JSON valid.
3. **`/ask-ai` text "Tanya apa saja" tidak ada di SSR** → text di-belakang `isHistoryLoaded` guard (client-only). Ubah test `ask-ai page loads` dari `request.get` ke `page.goto` + `waitForSelector` + `getByRole('heading', { name: 'Ask AI' })`.

**Hasil eksekusi final: 23 passed / 0 failed (47.8s)** ✅

**Catatan tambahan:**
- Hapus `forbidSerial: true` dari `playwright.config.ts` — bukan properti valid di `@playwright/test` 1.62.1 (menyebabkan `tsc --noEmit` gagal; sebelumnya tersembunyi karena file belum di-commit).
- Hapus unused import `type APIRequestContext` dari 3 file test → lint kembali 0/0.

**Yang sudah dilakukan (final):**

---

### ✅ No 6 — Helper `requireAdmin` untuk hapus duplikasi
**Status: SELESAI**

**Masalah:**
- Pattern mock-vs-supabase diulang ~15× di `actions/` modules.
- Setiap action punya struktur: `if (!hasSupabaseConfig()) { mock path } else { supabase + auth.getUser() }`.

**Implementasi:**

Tambah helper di `src/app/admin/actions/_shared.ts`:
```ts
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin(): Promise<{ supabase: SupabaseClient; user: User } | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return { supabase, user }
  } catch {
    return null
  }
}
```

**Refactor applied ke 11 modul:**
| Modul | Actions di-refactor |
|---|---|
| `profile.ts` | `updateProfileAction` (pakai `user.id` untuk upload & upsert) |
| `projects.ts` | `saveProjectAction`, `deleteProjectAction`, `updateProjectsOrderAction`, `updateFeaturedProjectsOrderAction` |
| `messages.ts` | `getMessagesAction` (throw on null), `toggleMessageReadAction`, `deleteMessageAction` |
| `education.ts` | `saveEducationAction`, `deleteEducationAction` |
| `experience.ts` | `saveExperienceAction`, `deleteExperienceAction` |
| `certificates.ts` | `saveCertificateAction`, `deleteCertificateAction` |
| `uploads.ts` | `uploadAssetAction` |
| `ai.ts` | `saveAISettingsAction`, `getAIChatLogsAction` (throw), `clearAIChatLogsAction` |
| `skills.ts` | `saveSkillAction`, `deleteSkillAction`, `updateSkillsTextAction` (pakai `user.id`) |
| `analytics.ts` | `getVisitorStatsAction`, `resetVisitorAnalyticsAction`, `getMonthlyVisitorStatsAction`, `getAvailableYearsAction` |
| `photos.ts` | `savePhotoAction`, `deletePhotoAction` |

**Catatan:**
- `trackPageViewAction` (analytics) tetap pakai `createClient` langsung karena public action (visitor tracking, no auth).
- Pesan error dipertahankan per-modul: `'Unauthorized'` (default), `'Unauthorized admin user'` (profile, uploads, updateSkillsText).
- `import { createClient }` dihapus dari 10 modul (kecuali `analytics.ts` yang masih butuh untuk `trackPageViewAction`).

**Dampak:**
- Pengurangan ~32 baris kode duplikat.
- Auth check konsisten di satu tempat (helper), mudah audit.

**Verifikasi:**
- `npx eslint .` → 0 error, 0 warning ✅
- `npx tsc --noEmit` → lolos ✅
- `npm run build` → sukses (34 route) ✅
- `npm run test` → 23/23 pass ✅

---

## Status File yang Berubah

### File dimodifikasi (no 1-4):
- `src/components/admin/projects/ProjectForm.tsx`
- `src/lib/ai-service.ts`
- `src/lib/data-service.ts`
- `src/lib/utils.ts`
- `src/components/experience-filter-list.tsx`
- `src/app/education/page.tsx`
- `src/components/admin/experience/ExperienceTableView.tsx`
- `src/components/admin/experience/ExperienceControls.tsx`
- `src/components/admin/experience/ExperienceForm.tsx`
- `src/components/admin/photos/PhotoGridView.tsx`
- `src/components/admin/photos/PhotoTableView.tsx`
- `src/components/admin/photos/PhotosControls.tsx`
- `src/components/admin/certificates/CertificateControls.tsx`
- `src/components/admin/certificates/CertificateForm.tsx`
- `src/components/admin/certificates/CertificateTableView.tsx`
- `src/components/admin/education/EducationTableView.tsx`
- `src/components/admin/skills/SkillForm.tsx`
- `src/components/admin/skills/SkillGridView.tsx`
- `src/components/admin/skills/SkillTableView.tsx`
- `src/components/admin/skills/SkillsControls.tsx`
- `src/components/admin/skills/index.tsx`
- `src/components/admin/messages/index.tsx`
- `src/components/journey-marquee.tsx`
- `src/components/skills-marquee.tsx`
- `src/app/contact/actions.ts`
- `src/app/login/actions.ts`
- `.gitignore`
- `package.json`
- `AGENTS.md`

### File baru (no 3):
- `src/app/admin/actions.ts` (ditulis ulang jadi barrel)
- `src/app/admin/actions/_shared.ts`
- `src/app/admin/actions/messages.ts`
- `src/app/admin/actions/profile.ts`
- `src/app/admin/actions/projects.ts`
- `src/app/admin/actions/education.ts`
- `src/app/admin/actions/experience.ts`
- `src/app/admin/actions/certificates.ts`
- `src/app/admin/actions/uploads.ts`
- `src/app/admin/actions/ai.ts`
- `src/app/admin/actions/skills.ts`
- `src/app/admin/actions/analytics.ts`
- `src/app/admin/actions/photos.ts`

### File baru (no 5):
- `playwright.config.ts`
- `tests/middleware-auth.spec.ts`
- `tests/api-chat.spec.ts`
- `tests/admin-actions-auth.spec.ts`
- `tests/supabase-fallback.spec.ts`

---

## Verifikasi Status Saat Ini

```bash
# Lint (harus 0 error, 0 warning)
npm run lint

# Typecheck (harus lolos)
npx tsc --noEmit

# Build production (harus sukses)
npm run build

# Test (23/23 pass)
npm run test
```

**Status terkini:**
- ✅ Lint: 0 error, 0 warning
- ✅ Typecheck: lolos
- ✅ Build: sukses (34 route terkompilasi)
- ✅ Test: 23/23 pass

---

## Langkah Selanjutnya (Opsional)

Semua 6 perbaikan utama + 4 item opsional selesai.

**Item opsional (SELESAI):**
- ✅ `process.env.X!` non-null assertion di Supabase clients (`server.ts`, `client.ts`, `middleware.ts`) → guard eksplisit via `getSupabaseEnv()` helper yang throw error jelas saat env missing.
- ✅ `schema.sql` idempotent — `CREATE TABLE IF NOT EXISTS` di semua 12 tabel, enum types dibungkus `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object`, `DROP POLICY IF EXISTS` sebelum `CREATE POLICY`, `DROP TRIGGER IF EXISTS` sebelum `CREATE TRIGGER`.
- ✅ IP `x-forwarded-for` di-split & ambil IP pertama di `src/app/api/chat/route.ts` dan `trackPageViewAction` (analytics.ts).
- ✅ `trackPageViewAction` rate-limit/debounce per IP — in-memory throttle Map, 1 insert per 60s per `(IP, pagePath)`, opportunistic cleanup saat Map > 10k entries.

**Verifikasi final:**
- ✅ Lint: 0 error, 0 warning
- ✅ Typecheck: lolos
- ✅ Build: sukses (34 route)
- ✅ Test: 23/23 pass

Sisa: commit semua perubahan (setelah inspeksi `git status` / `git diff`).

---

## Catatan Penting

- **`.env.local` ada** — tidak boleh ter-commit (sudah di-gitignore via `.env*`).
- **Browser binary chromium-1234 ada** di `C:\Users\HYPE-R FLIP\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe` — dipakai sebagai `executablePath` di `playwright.config.ts` karena `chromium_headless_shell-1234` belum ter-install.
- **`trackPageViewAction` throttle hilang saat cold-start** — by design, client-side `sessionStorage` guard sudah dedupe traffic normal; throttle adalah backstop untuk abuse.

---

_Dokumen ini dibuat untuk handoff sesi. Hapus setelah selesai atau jadikan referensi changelog._
