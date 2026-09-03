# Security Audit Report — SSRF & Image Route Audit

> **Date:** 2026-09-03
> **Scope:** `/api/images/[filename]`, image fetching, upload actions
> **Skill used:** `exploiting-server-side-request-forgery`, `performing-directory-traversal-testing`
> **Status:** PASS — No SSRF vectors found

---

## Findings

### 1. `/api/images/[filename]` Route — EMPTY
**Location:** `src/app/api/images/[filename]/`
**Finding:** Directory exists but contains no route handler (`route.ts`). The route is non-functional.
**Risk:** NONE — No code to exploit.
**Recommendation:** Remove empty directory or implement with proper validation if needed.

### 2. `fetchSimpleIconPath()` — Hardcoded CDN URL (NO SSRF)
**Location:** `src/app/admin/actions/skills.ts:36-48`
**Code:**
```typescript
const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`
const res = await fetch(url)
```
**Analysis:**
- Base URL hardcoded to `https://cdn.jsdelivr.net/`
- `slug` sanitized via `slugifyForSimpleIcons()` — strips to `[a-z0-9]` only
- No user-controlled URL input
- Admin-only action (requires `requireAdmin()` in Supabase mode)
**Risk:** NONE — Not an SSRF vector.

### 3. Upload Action — Supabase Storage (NO SSRF)
**Location:** `src/app/admin/actions/uploads.ts`
**Analysis:**
- Files uploaded directly to Supabase Storage bucket `portfolio-assets`
- No external URL fetching
- Admin-only action
**Risk:** NONE for SSRF.

### 4. File Upload — Missing Type Validation (MEDIUM)
**Location:** `src/app/admin/actions/uploads.ts:29-34`
**Finding:** No file type validation. File extension extracted via `file.name.split('.').pop()` without allowlist.
**Risk:** MEDIUM — Admin could upload `.html`, `.svg`, `.js` files. If served with wrong Content-Type from Supabase Storage, could lead to stored XSS.
**Note:** Risk is lower because action is admin-only, but defense-in-depth recommends validation.

---

## Recommendations

| # | Priority | Recommendation |
|---|---|---|
| 1 | Medium | Add file type allowlist in `uploadAssetAction` (jpg, png, webp, svg-only-with-sanitization) |
| 2 | Low | Remove empty `/api/images/[filename]` directory |
| 3 | Low | Add Content-Type validation on upload (verify `file.type` matches extension) |
| 4 | Low | Consider scanning uploaded SVGs for embedded `<script>` tags |
