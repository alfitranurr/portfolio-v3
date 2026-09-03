# Security Audit Report — Broken Access Control

> **Date:** 2026-09-03
> **Scope:** Admin server actions, middleware auth, IDOR
> **Skill used:** `testing-for-broken-access-control` (OWASP A01:2021)
> **Status:** FIX APPLIED — 1 missing auth check added

---

## Audit Method

Scanned all 25+ exported server actions in `src/app/admin/actions/` for `requireAdmin()` calls in the Supabase (production) branch.

---

## Findings

### 1. MEDIUM — Missing `requireAdmin()` in `getAISettingsAction` (FIXED)
**Location:** `src/app/admin/actions/ai.ts:13-15`
**Finding:** `getAISettingsAction()` called `getAISettings()` directly without admin auth check. Any client could invoke this server action.
**Impact:** LOW — Returns only config (model name, temperature, max_history), NOT the `GEMINI_API_KEY`. Supabase RLS provides secondary protection.
**Fix:** Added `requireAdmin()` check; returns default settings if not admin.

### 2. PASS — All Other Admin Actions Have `requireAdmin()`

| Action File | Actions | Auth Check |
|---|---|---|
| `projects.ts` | saveProjectAction, deleteProjectAction, updateProjectsOrderAction, updateFeaturedProjectsOrderAction | ✅ All have `requireAdmin()` |
| `photos.ts` | savePhotoAction, deletePhotoAction | ✅ Both have `requireAdmin()` |
| `experience.ts` | saveExperienceAction, deleteExperienceAction | ✅ Both have `requireAdmin()` |
| `education.ts` | saveEducationAction, deleteEducationAction | ✅ Both have `requireAdmin()` |
| `certificates.ts` | saveCertificateAction, deleteCertificateAction | ✅ Both have `requireAdmin()` |
| `skills.ts` | saveSkillAction, deleteSkillAction, updateSkillsTextAction | ✅ All have `requireAdmin()` |
| `profile.ts` | updateProfileAction | ✅ Has `requireAdmin()` |
| `messages.ts` | getMessagesAction, toggleMessageReadAction, deleteMessageAction | ✅ All have `requireAdmin()` |
| `ai.ts` | saveAISettingsAction, getAIChatLogsAction, clearAIChatLogsAction | ✅ All have `requireAdmin()` |
| `uploads.ts` | uploadAssetAction | ✅ Has `requireAdmin()` |
| `cache.ts` | revalidatePublicPagesAction | ✅ Has `requireAdmin()` |
| `analytics.ts` | getVisitorStatsAction, resetVisitorAnalyticsAction, getMonthlyVisitorStatsAction, getAvailableYearsAction | ✅ All have `requireAdmin()` |

### 3. PASS — `trackPageViewAction` (Intentionally Public)
**Location:** `src/app/admin/actions/analytics.ts:33`
**Finding:** No `requireAdmin()` — intentional, this is a public action called by visitors for page view tracking.
**Protection:** In-memory throttle (1 req/minute per IP+page) prevents abuse.
**Status:** ✅ By design

### 4. PASS — Middleware Route Protection
**Location:** `src/lib/supabase/middleware.ts:55-63`
**Finding:** All `/admin/*` paths require authentication. Unauthenticated users redirected to `/login`.
**Mock mode:** `mock_logged_in` cookie only honored when `hasConfig === false` (dev only).
**Status:** ✅ Secure

### 5. PASS — IDOR Analysis
**Finding:** Admin actions use `.eq('id', resource_id)` for updates/deletes, but since there's only one admin user, IDOR is not applicable. All resources are owned by the single admin.
**Status:** ✅ N/A (single-tenant)

### 6. PASS — Mock Login Backdoor
**Location:** `src/app/login/actions.ts:23-36`
**Finding:** Mock login only runs when `hasConfig === false` (no Supabase). In production, Supabase auth is the sole authority.
**Previous fix:** Commit `94f5938` closed this backdoor.
**Cookie hardening:** Added `httpOnly`, `sameSite: 'strict'` in this audit.
**Status:** ✅ Secure

---

## Recommendations

| # | Priority | Recommendation |
|---|---|---|
| 1 | High | Verify Supabase RLS policies are enabled on all tables (defense-in-depth) |
| 2 | Medium | Consider adding role-based checks (not just "is authenticated") if multiple admins are added |
| 3 | Low | Add rate limiting to admin actions to prevent brute-force |
