# Security Audit — Batch 3 Report (CI/CD + Threat Model)

> **Date:** 2026-09-03
> **Scope:** CSP, CI/CD security scanning, pre-commit hooks, LLM red-team, threat model, HSTS, iframe allowlist, IP anonymization
> **Status:** All 10 remaining items completed

---

## Items Completed in This Batch (10)

### 1. CSP Header (High)
**File:** `next.config.ts`
**Fix:** Added `Content-Security-Policy` header with:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (Next.js requires these)
- `style-src 'self' 'unsafe-inline' fonts.googleapis.com`
- `img-src 'self' data: blob: https:` (Supabase, Google, Unsplash)
- `connect-src 'self' generativelanguage.googleapis.com *.supabase.co`
- `frame-src` allowlist: Tableau, YouTube, Plotly
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`
- `frame-ancestors 'self'` (clickjacking prevention)
- `upgrade-insecure-requests`

### 2. Gitleaks Pre-Commit Hook (High)
**File:** `.pre-commit-config.yaml`
**Hooks:**
- `gitleaks` — Secret scanning on every commit
- `trailing-whitespace` — Trim trailing whitespace
- `end-of-file-fixer` — Ensure newline at EOF
- `check-yaml` / `check-json` — Validate config files
- `detect-private-key` — Block private key commits
- `check-added-large-files` — Max 1MB
- `eslint` — Run ESLint on staged JS/TS files

**Install:** `pip install pre-commit && pre-commit install`

### 3. SCA Scan in CI (High)
**File:** `.github/workflows/security.yml`
**Job:** `sca-npm-audit`
- Runs `npm audit --omit=dev --audit-level=high`
- Uploads JSON report as artifact
- Triggers on push, PR, and weekly schedule

### 4. SAST in CI (High)
**File:** `.github/workflows/security.yml`
**Job:** `semgrep`
- Runs Semgrep with rules: `p/nextjs`, `p/react`, `p/javascript`, `p/owasp-top-ten`, `p/typescript`
- Generates SARIF report
- Uploads to GitHub Security tab
- Triggers on push, PR, and weekly schedule

### 5. Supabase RLS Verification (High)
**File:** `schema.sql` (existing)
**Result:** ✅ PASS — RLS enabled on all 12 tables:
- `profiles`, `projects`, `experiences`, `education`, `certificates`, `messages`
- `skills`, `page_views`, `ai_settings`, `ai_chat_logs`, `photos`
- `storage.objects` (portfolio-assets bucket)

**Policies verified:**
- Public SELECT on portfolio data (profiles, projects, experiences, education, certificates, skills, photos)
- Public INSERT only on messages, page_views, ai_chat_logs
- Admin (authenticated) full access on all tables
- No public write access on any table except messages/page_views/ai_chat_logs (INSERT only)

### 6. IP Anonymization (Medium)
**Files:** `src/lib/ai-service.ts`, `src/app/api/chat/route.ts`
**Fix:**
- Added `anonymizeIP()` function (exported from `ai-service.ts`)
- IPv4: Zero last octet (192.168.1.42 → 192.168.1.0)
- IPv6: Truncate to first 4 hextets + `::`
- Fallback: SHA-256 hash (16 chars)
- Applied in `/api/chat` route before `logAIChat()`

### 7. LLM Red-Team Regression Test (Medium)
**Files:** `promptfooconfig.yaml`, `.github/workflows/llm-redteam.yml`
**Config:** Promptfoo red-team with plugins:
- `prompt-extraction` — System prompt leakage (LLM07)
- `prompt-injection` — Direct injection (LLM01)
- `indirect-prompt-injection` — RAG poisoning
- `rag-document-exfiltration` — Data exfil via RAG
- `harmful:privacy`, `pii` — Privacy violations
- `jailbreak` strategies: leetspeak, rot13, base64

**CI:** Runs on changes to `src/app/api/chat/`, `src/lib/rag-context.ts`, `src/lib/ai-service.ts`

### 8. Iframe Src Allowlist (Low)
**File:** `src/app/projects/[id]/page.tsx`
**Fix:** Updated `sanitizeEmbedCode()` with domain allowlist:
- `tableau.com`, `public.tableau.com`
- `www.youtube.com`, `www.youtube-nocookie.com`
- `chart-studio.plotly.com`, `plotly.com`
- `embeddable.surveyjs.org`
- Iframes with untrusted src are stripped entirely

### 9. HSTS Preload Guidance (Low)
**File:** `SECURITY_HSTS_PRELOAD.md`
**Content:** Step-by-step guide for submitting domain to hstspreload.org after deploy. HSTS header already configured with `preload` directive.

### 10. Threat Model Diagram (Low)
**File:** `SECURITY_THREAT_MODEL.md`
**Content:** Full STRIDE analysis with:
- System architecture diagram
- 16 threats across 6 STRIDE categories
- Top 5 prioritized threats (all mitigated)
- 2 attack trees (prompt extraction, stored XSS)

---

## New Files Created

| File | Purpose |
|---|---|
| `.github/workflows/security.yml` | SAST (Semgrep) + SCA (npm audit) + Gitleaks + ESLint |
| `.github/workflows/llm-redteam.yml` | Promptfoo LLM red-team regression |
| `.pre-commit-config.yaml` | Pre-commit hooks (gitleaks, eslint, file checks) |
| `promptfooconfig.yaml` | Promptfoo red-team config for /api/chat |
| `SECURITY_THREAT_MODEL.md` | STRIDE threat model |
| `SECURITY_HSTS_PRELOAD.md` | HSTS preload submission guide |
| `SECURITY_AUDIT_BATCH3.md` | This report |

## Files Modified

| File | Change |
|---|---|
| `next.config.ts` | Added CSP header |
| `src/app/projects/[id]/page.tsx` | Iframe src allowlist in sanitizeEmbedCode |
| `src/lib/ai-service.ts` | Added anonymizeIP() function (exported) |
| `src/app/api/chat/route.ts` | Import + use anonymizeIP for logAIChat |

---

## Verification

| Check | Result |
|---|---|
| `npm run lint` | ✅ PASS |
| `npm run build` | ✅ PASS (34 pages) |
| RLS policies (schema.sql) | ✅ All 12 tables have RLS |
| CSP header configured | ✅ In next.config.ts |
| Pre-commit hooks | ✅ .pre-commit-config.yaml |
| CI workflows | ✅ 2 workflow files |
