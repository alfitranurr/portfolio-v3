# Security Skills Prompt — portfolio-v3

> Panduan untuk AI agent dalam menggunakan [Anthropic Cybersecurity Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) (818 skill, 34 domain) untuk mengaudit, menguji, dan mengamankan project **portfolio-v3**.

---

## Tentang Project Ini

**portfolio-v3** adalah website portfolio personal milik Al Fitra Nur Ramadhani yang dibangun dengan:

| Komponen | Teknologi | Lokasi |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router, Server Actions) | root |
| UI | React 19.2.4, TailwindCSS v4, Framer Motion | `src/components/`, `src/app/` |
| Database & Auth | Supabase (Postgres + Auth + JWT sessions + Storage) | `src/lib/supabase/` |
| AI Chatbot | Google Gemini (`@google/genai`) dengan RAG context | `src/lib/ai-service.ts`, `src/lib/rag-context.ts`, `src/app/api/chat/route.ts` |
| API Routes | `/api/chat`, `/api/images` | `src/app/api/` |
| Admin Panel | Server Actions CRUD (projects, certificates, education, experience, photos, skills, profile, ai-settings, analytics, cache, messages, uploads) | `src/app/admin/actions/` |
| Testing | Playwright (mock mode, port 3111) | `tests/*.spec.ts` |
| Deployment | Vercel | `.vercel/` |
| Middleware | Supabase session update via `src/proxy.ts` | root |

### Attack Surface Utama

1. **AI Chatbot (Gemini + RAG)** — `src/lib/rag-context.ts` membangun context dari database lalu disuntik ke system prompt (`buildSystemPrompt`). User input di `/api/chat` langsung diteruskan ke LLM. **Risiko: prompt injection, indirect prompt injection via data poisoning, system prompt leakage, data exfiltration.**
2. **Admin Panel + Server Actions** — CRUD portfolio data via Supabase RLS. **Risiko: broken access control, IDOR, mass assignment, privilege escalation.**
3. **Supabase Auth** — JWT session cookies, middleware session refresh. **Risiko: JWT tampering, OAuth misconfiguration, session fixation.**
4. **API Routes** — `/api/chat` (AI), `/api/images` (image proxy/fetch). **Risiko: SSRF via image URL, rate limit absence, API enumeration.**
5. **Npm Supply Chain** — dependencies di `package.json` (`@google/genai`, `@supabase/ssr`, dll). **Risiko: dependency confusion, malicious package, typosquatting.**
6. **Web App (XSS/CSRF/CORS)** — React SSR, markdown rendering (`react-markdown`), contact form. **Risiko: stored XSS via markdown, CSRF pada form, CORS misconfiguration.**
7. **Data Privacy** — `ai_chat_logs` menyimpan `user_ip`, `prompt_preview`. **Risiko: GDPR/privacy compliance.**

---

## Cara AI Agent Menggunakan Skills Ini

```
1. Baca tabel mapping di bawah untuk menemukan skill yang relevan dengan task keamanan Anda.
2. Load file SKILL.md lengkap dari path relatif yang ditunjuk (di luar repo ini).
3. Ikuti section "Workflow" / "When to Use" / "Prerequisites" / "Verification" secara step-by-step.
4. Sesuaikan perintah/proses dengan stack project ini (Next.js 16, Supabase, Gemini, Vercel).
5. Dokumentasikan temuan dengan format section "Output Format" dari skill yang relevan.
```

### Aturan Penggunaan

- **Authorized use only.** Hanya uji sistem yang Anda miliki atau punya izin tertulis. Project ini milik author, jadi testing di local dev (`npm run dev`, port 3000) atau mock mode (`npm run test`, port 3111) diizinkan.
- Repo skill berada di **sibling folder** di luar project ini. Path relatif dari root project:
  ```
  ../../Anthropic-Cybersecurity-Skills/skills/<skill-name>/SKILL.md
  ```
- Setiap skill berformat YAML frontmatter (~30 tokens untuk scan) + Markdown body (500–2000 tokens untuk full load). Gunakan progressive disclosure: scan frontmatter dulu, load body hanya untuk skill yang dipilih.
- Skill dapat memiliki folder `references/` (standards.md, workflows.md, api-reference.md), `scripts/`, dan `assets/` — manfaatkan untuk konteks mendalam.

---

## Mapping Attack Surface → Skills

| Attack Surface Project | Skill yang Direkomendasikan | Path SKILL.md |
|---|---|---|
| AI Chatbot (prompt injection) | testing-prompt-injection-in-rag-pipelines | `../../Anthropic-Cybersecurity-Skills/skills/testing-prompt-injection-in-rag-pipelines/SKILL.md` |
| AI Chatbot (system prompt leak) | testing-for-system-prompt-leakage | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-system-prompt-leakage/SKILL.md` |
| AI Chatbot (indirect injection) | detecting-indirect-prompt-injection | `../../Anthropic-Cybersecurity-Skills/skills/detecting-indirect-prompt-injection/SKILL.md` |
| Admin Server Actions (access control) | testing-for-broken-access-control | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-broken-access-control/SKILL.md` |
| Admin CRUD (IDOR) | exploiting-idor-vulnerabilities | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-idor-vulnerabilities/SKILL.md` |
| API `/api/images` (SSRF) | performing-ssrf-vulnerability-exploitation | `../../Anthropic-Cybersecurity-Skills/skills/performing-ssrf-vulnerability-exploitation/SKILL.md` |
| Markdown rendering (XSS) | testing-for-xss-vulnerabilities | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-xss-vulnerabilities/SKILL.md` |
| npm dependencies (supply chain) | detecting-dependency-confusion | `../../Anthropic-Cybersecurity-Skills/skills/detecting-dependency-confusion/SKILL.md` |
| Supabase Auth (JWT) | testing-jwt-token-security | `../../Anthropic-Cybersecurity-Skills/skills/testing-jwt-token-security/SKILL.md` |
| User IP logging (privacy) | conducting-gdpr-compliance-assessment | `../../Anthropic-Cybersecurity-Skills/skills/conducting-gdpr-compliance-assessment/SKILL.md` |

---

## 1. AI Security (Gemini + RAG)

> **Konteks project:** Chatbot Gemini di `src/app/api/chat/route.ts` menggunakan RAG context dari `src/lib/rag-context.ts` (mengambil profile, projects, education, experience, certificates, skills, photos dari Supabase) dan system prompt hardcoded `buildSystemPrompt()` di `src/lib/rag-context.ts:126`. User message diteruskan ke Gemini API. `ai_chat_logs` menyimpan prompt + IP user.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | testing-prompt-injection-in-rag-pipelines | RAG context dari DB bisa di-poisoning via admin CRUD → indirect injection saat di-retrieve | `../../Anthropic-Cybersecurity-Skills/skills/testing-prompt-injection-in-rag-pipelines/SKILL.md` |
| 2 | testing-for-system-prompt-leakage | System prompt panjang di `buildSystemPrompt()` berisi aturan + data portfolio → bisa di-leak | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-system-prompt-leakage/SKILL.md` |
| 3 | detecting-indirect-prompt-injection | Data portfolio (project description, certificates) bisa berisi instruksi tersembunyi | `../../Anthropic-Cybersecurity-Skills/skills/detecting-indirect-prompt-injection/SKILL.md` |
| 4 | defending-llms-with-guardrails | Tambahkan guardrails input/output filtering di `/api/chat` | `../../Anthropic-Cybersecurity-Skills/skills/defending-llms-with-guardrails/SKILL.md` |
| 5 | implementing-llm-guardrails-for-security | Implementasi guardrails khusus untuk mencegah prompt injection | `../../Anthropic-Cybersecurity-Skills/skills/implementing-llm-guardrails-for-security/SKILL.md` |
| 6 | red-teaming-llms-with-garak | Red-team otomatis chatbot dengan garak | `../../Anthropic-Cybersecurity-Skills/skills/red-teaming-llms-with-garak/SKILL.md` |
| 7 | orchestrating-llm-attacks-with-pyrit | Multi-turn injection campaign via PyRIT | `../../Anthropic-Cybersecurity-Skills/skills/orchestrating-llm-attacks-with-pyrit/SKILL.md` |
| 8 | assessing-vector-and-embedding-weaknesses | Jika未来 pakai vector store (pgvector) untuk RAG | `../../Anthropic-Cybersecurity-Skills/skills/assessing-vector-and-embedding-weaknesses/SKILL.md` |
| 9 | continuous-llm-red-teaming-with-promptfoo | Regression gate di CI/CD untuk chatbot | `../../Anthropic-Cybersecurity-Skills/skills/continuous-llm-red-teaming-with-promptfoo/SKILL.md` |
| 10 | detecting-ai-model-prompt-injection-attacks | Deteksi pola injection di `ai_chat_logs` | `../../Anthropic-Cybersecurity-Skills/skills/detecting-ai-model-prompt-injection-attacks/SKILL.md` |
| 11 | testing-for-sensitive-data-exposure | Cek apakah chatbot bisa di-extract data sensitif (admin credentials, PII) | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-sensitive-data-exposure/SKILL.md` |
| 12 | securing-agentic-ai-tool-invocation | Jika chatbot diberi tool-calling capability | `../../Anthropic-Cybersecurity-Skills/skills/securing-agentic-ai-tool-invocation/SKILL.md` |
| 13 | auditing-mcp-servers-for-tool-poisoning | Jika menggunakan MCP server untuk tools AI | `../../Anthropic-Cybersecurity-Skills/skills/auditing-mcp-servers-for-tool-poisoning/SKILL.md` |

---

## 2. Web Application Security

> **Konteks project:** Next.js 16 App Router, React 19, `react-markdown` untuk render content project, contact form di `src/app/contact/`, SSR pages. `react-markdown` berisiko XSS jika tidak ada `rehype-sanitize`.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | testing-for-xss-vulnerabilities | Stored XSS via project content / certificate → render dengan react-markdown | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-xss-vulnerabilities/SKILL.md` |
| 2 | testing-cors-misconfiguration | API routes `/api/chat`, `/api/images` — cek CORS header | `../../Anthropic-Cybersecurity-Skills/skills/testing-cors-misconfiguration/SKILL.md` |
| 3 | testing-for-broken-access-control | Admin panel server actions — apakah non-admin bisa akses? | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-broken-access-control/SKILL.md` |
| 4 | performing-csrf-attack-simulation | Contact form & admin actions — CSRF protection? | `../../Anthropic-Cybersecurity-Skills/skills/performing-csrf-attack-simulation/SKILL.md` |
| 5 | performing-security-headers-audit | Cek `next.config.ts` headers (CSP, HSTS, X-Frame-Options) | `../../Anthropic-Cybersecurity-Skills/skills/performing-security-headers-audit/SKILL.md` |
| 6 | performing-content-security-policy-bypass | CSP di Next.js — bypass via `unsafe-inline`? | `../../Anthropic-Cybersecurity-Skills/skills/performing-content-security-policy-bypass/SKILL.md` |
| 7 | exploiting-prototype-pollution-in-javascript | Dependencies client-side (clsx, tailwind-merge) | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-prototype-pollution-in-javascript/SKILL.md` |
| 8 | exploiting-idor-vulnerabilities | Admin actions — `updateProject(id)` tanpa ownership check | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-idor-vulnerabilities/SKILL.md` |
| 9 | testing-for-open-redirect-vulnerabilities | Redirect setelah login admin | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-open-redirect-vulnerabilities/SKILL.md` |
| 10 | testing-for-business-logic-vulnerabilities | Logic flaws di admin CRUD flow | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-business-logic-vulnerabilities/SKILL.md` |
| 11 | exploiting-server-side-request-forgery | `/api/images` route — fetch external URL → SSRF | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-server-side-request-forgery/SKILL.md` |
| 12 | performing-directory-traversal-testing | `/api/images` — path traversal di image path | `../../Anthropic-Cybersecurity-Skills/skills/performing-directory-traversal-testing/SKILL.md` |
| 13 | testing-for-host-header-injection | Host header manipulation di Next.js | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-host-header-injection/SKILL.md` |
| 14 | testing-for-email-header-injection | Contact form — header injection di email | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-email-header-injection/SKILL.md` |
| 15 | exploiting-broken-link-hijacking | External links (github_url, demo_url, linkedin) — BLH | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-broken-link-hijacking/SKILL.md` |
| 16 | performing-clickjacking-attack-test | X-Frame-Options / CSP frame-ancestors | `../../Anthropic-Cybersecurity-Skills/skills/performing-clickjacking-attack-test/SKILL.md` |
| 17 | exploiting-http-request-smuggling | Next.js server — request smuggling | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-http-request-smuggling/SKILL.md` |
| 18 | testing-for-xml-injection-vulnerabilities | Jika ada XML parsing di API | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-xml-injection-vulnerabilities/SKILL.md` |
| 19 | testing-for-xxe-injection-vulnerabilities | XML external entity di image endpoint | `../../Anthropic-Cybersecurity-Skills/skills/testing-for-xxe-injection-vulnerabilities/SKILL.md` |
| 20 | exploiting-websocket-vulnerabilities | Jika chatbot pakai WebSocket | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-websocket-vulnerabilities/SKILL.md` |
| 21 | testing-websocket-api-security | WebSocket security testing | `../../Anthropic-Cybersecurity-Skills/skills/testing-websocket-api-security/SKILL.md` |
| 22 | performing-web-application-firewall-bypass | Vercel WAF / Cloudflare bypass | `../../Anthropic-Cybersecurity-Skills/skills/performing-web-application-firewall-bypass/SKILL.md` |
| 23 | performing-web-application-penetration-test | End-to-end pentest portfolio | `../../Anthropic-Cybersecurity-Skills/skills/performing-web-application-penetration-test/SKILL.md` |
| 24 | performing-web-application-scanning-with-nikto | Automated scan Vercel deployment | `../../Anthropic-Cybersecurity-Skills/skills/performing-web-application-scanning-with-nikto/SKILL.md` |

---

## 3. API Security

> **Konteks project:** API routes: `/api/chat` (POST, AI chat), `/api/images` (image fetch). Admin server actions via Supabase RLS. Tidak ada rate limiting terlihat.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | testing-api-security-with-owasp-top-10 | OWASP API Top 10 untuk `/api/chat` & `/api/images` | `../../Anthropic-Cybersecurity-Skills/skills/testing-api-security-with-owasp-top-10/SKILL.md` |
| 2 | testing-api-authentication-weaknesses | Auth di admin API — Supabase JWT validation | `../../Anthropic-Cybersecurity-Skills/skills/testing-api-authentication-weaknesses/SKILL.md` |
| 3 | testing-api-for-broken-object-level-authorization | BOLA di admin actions (resource ID) | `../../Anthropic-Cybersecurity-Skills/skills/testing-api-for-broken-object-level-authorization/SKILL.md` |
| 4 | testing-api-for-mass-assignment-vulnerability | Mass assignment di server action `updateProject` | `../../Anthropic-Cybersecurity-Skills/skills/testing-api-for-mass-assignment-vulnerability/SKILL.md` |
| 5 | performing-api-rate-limiting-bypass | `/api/chat` tanpa rate limit → abuse Gemini API | `../../Anthropic-Cybersecurity-Skills/skills/performing-api-rate-limiting-bypass/SKILL.md` |
| 6 | implementing-api-rate-limiting-and-throttling | Tambah rate limit di `/api/chat` | `../../Anthropic-Cybersecurity-Skills/skills/implementing-api-rate-limiting-and-throttling/SKILL.md` |
| 7 | implementing-api-key-security-controls | `GEMINI_API_KEY` handling & rotation | `../../Anthropic-Cybersecurity-Skills/skills/implementing-api-key-security-controls/SKILL.md` |
| 8 | detecting-api-enumeration-attacks | Deteksi enumeration di `/api/chat` | `../../Anthropic-Cybersecurity-Skills/skills/detecting-api-enumeration-attacks/SKILL.md` |
| 9 | implementing-api-schema-validation-security | Validasi input di server actions | `../../Anthropic-Cybersecurity-Skills/skills/implementing-api-schema-validation-security/SKILL.md` |
| 10 | implementing-api-security-posture-management | Posture management API Vercel | `../../Anthropic-Cybersecurity-Skills/skills/implementing-api-security-posture-management/SKILL.md` |
| 11 | exploiting-mass-assignment-in-rest-apis | Mass assignment via Supabase update | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-mass-assignment-in-rest-apis/SKILL.md` |
| 12 | exploiting-excessive-data-exposure-in-api | API response mengembalikan field sensitif | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-excessive-data-exposure-in-api/SKILL.md` |
| 13 | testing-api-fuzzing-with-restler | Fuzz `/api/chat` dengan RESTler | `../../Anthropic-Cybersecurity-Skills/skills/performing-api-fuzzing-with-restler/SKILL.md` |
| 14 | performing-api-inventory-and-discovery | Inventory semua endpoint (termasuk shadow API) | `../../Anthropic-Cybersecurity-Skills/skills/performing-api-inventory-and-discovery/SKILL.md` |
| 15 | detecting-shadow-api-endpoints | Shadow API di Next.js dynamic routes | `../../Anthropic-Cybersecurity-Skills/skills/detecting-shadow-api-endpoints/SKILL.md` |
| 16 | implementing-api-abuse-detection-with-rate-limiting | Abuse detection di Gemini chat | `../../Anthropic-Cybersecurity-Skills/skills/implementing-api-abuse-detection-with-rate-limiting/SKILL.md` |
| 17 | performing-api-security-testing-with-postman | Postman collection untuk `/api/chat` | `../../Anthropic-Cybersecurity-Skills/skills/performing-api-security-testing-with-postman/SKILL.md` |
| 18 | conducting-api-security-testing | End-to-end API security testing | `../../Anthropic-Cybersecurity-Skills/skills/conducting-api-security-testing/SKILL.md` |

---

## 4. Identity & Access Management (Supabase Auth)

> **Konteks project:** Supabase Auth dengan JWT session cookies, middleware `src/proxy.ts` → `updateSession()`, admin login di `src/app/login/`, admin actions cek session. Mock admin: `admin@portfolio.test` / `test-password-123`.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | testing-oauth2-implementation-flaws | Supabase OAuth config — jika ada social login | `../../Anthropic-Cybersecurity-Skills/skills/testing-oauth2-implementation-flaws/SKILL.md` |
| 2 | testing-jwt-token-security | Supabase JWT session — tampering, algorithm confusion | `../../Anthropic-Cybersecurity-Skills/skills/testing-jwt-token-security/SKILL.md` |
| 3 | implementing-jwt-signing-and-verification | Validasi JWT di server actions | `../../Anthropic-Cybersecurity-Skills/skills/implementing-jwt-signing-and-verification/SKILL.md` |
| 4 | performing-privileged-account-access-review | Review admin role di Supabase | `../../Anthropic-Cybersecurity-Skills/skills/performing-privileged-account-access-review/SKILL.md` |
| 5 | exploiting-oauth-misconfiguration | OAuth flow Supabase — redirect URI | `../../Anthropic-Cybersecurity-Skills/skills/exploiting-oauth-misconfiguration/SKILL.md` |
| 6 | performing-oauth-scope-minimization-review | Scope Supabase anon key | `../../Anthropic-Cybersecurity-Skills/skills/performing-oauth-scope-minimization-review/SKILL.md` |
| 7 | implementing-conditional-access-policies-azure-ad | Jika pakai Azure AD/Entra (Supabase integration) | `../../Anthropic-Cybersecurity-Skills/skills/implementing-conditional-access-policies-azure-ad/SKILL.md` |

---

## 5. Supply Chain Security (npm)

> **Konteks project:** Dependencies di `package.json`: `@google/genai`, `@supabase/ssr`, `@supabase/supabase-js`, `next`, `framer-motion`, `lucide-react`, `react-markdown`, `clsx`, `tailwind-merge`, `next-themes`, `nextjs-toploader`. DevDeps: `@playwright/test`, `tailwindcss`, `eslint`, `typescript`.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | detecting-dependency-confusion | Cek `package.json` vs npm registry — private package collision | `../../Anthropic-Cybersecurity-Skills/skills/detecting-dependency-confusion/SKILL.md` |
| 2 | detecting-malicious-npm-packages | Triage `package-lock.json` — install scripts, exfiltration | `../../Anthropic-Cybersecurity-Skills/skills/detecting-malicious-npm-packages/SKILL.md` |
| 3 | analyzing-sbom-for-supply-chain-vulnerabilities | Generate SBOM dengan `npm sbom` / Syft | `../../Anthropic-Cybersecurity-Skills/skills/analyzing-sbom-for-supply-chain-vulnerabilities/SKILL.md` |
| 4 | generating-and-analyzing-sboms | Generate SBOM untuk Vercel deployment | `../../Anthropic-Cybersecurity-Skills/skills/generating-and-analyzing-sboms/SKILL.md` |
| 5 | detecting-typosquatting-packages-in-npm-pypi | Cek dependencies vs typosquatting list | `../../Anthropic-Cybersecurity-Skills/skills/detecting-typosquatting-packages-in-npm-pypi/SKILL.md` |
| 6 | detecting-typosquatting-packages | Typosquat detection script | `../../Anthropic-Cybersecurity-Skills/skills/detecting-typosquatting-packages/SKILL.md` |
| 7 | analyzing-typosquatting-domains-with-dnstwist | Domain typosquat untuk portfolio domain | `../../Anthropic-Cybersecurity-Skills/skills/analyzing-typosquatting-domains-with-dnstwist/SKILL.md` |
| 8 | verifying-build-provenance-with-slsa-sigstore | SLSA provenance untuk Vercel build | `../../Anthropic-Cybersecurity-Skills/skills/verifying-build-provenance-with-slsa-sigstore/SKILL.md` |
| 9 | implementing-code-signing-for-artifacts | Code signing untuk build artifacts | `../../Anthropic-Cybersecurity-Skills/skills/implementing-code-signing-for-artifacts/SKILL.md` |
| 10 | implementing-sigstore-for-software-signing | Sigstore untuk npm package signing | `../../Anthropic-Cybersecurity-Skills/skills/implementing-sigstore-for-software-signing/SKILL.md` |
| 11 | implementing-image-provenance-verification-with-cosign | Cosign untuk Vercel image | `../../Anthropic-Cybersecurity-Skills/skills/implementing-image-provenance-verification-with-cosign/SKILL.md` |
| 12 | implementing-supply-chain-security-with-in-toto | in-toto attestation untuk build | `../../Anthropic-Cybersecurity-Skills/skills/implementing-supply-chain-security-with-in-toto/SKILL.md` |

---

## 6. DevSecOps

> **Konteks project:** Build via `npm run build` (Vercel), ESLint flat config (`eslint.config.mjs`), Playwright tests, tidak ada SAST/DAST terlihat. `GEMINI_API_KEY` dan Supabase keys di `.env.local`.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | implementing-devsecops-security-scanning | Integrasi SAST/DAST/SCA di CI Vercel | `../../Anthropic-Cybersecurity-Skills/skills/implementing-devsecops-security-scanning/SKILL.md` |
| 2 | integrating-sast-into-github-actions-pipeline | SAST dengan Semgrep/CodeQL di GitHub Actions | `../../Anthropic-Cybersecurity-Skills/skills/integrating-sast-into-github-actions-pipeline/SKILL.md` |
| 3 | integrating-dast-with-owasp-zap-in-pipeline | DAST scan di CI/CD | `../../Anthropic-Cybersecurity-Skills/skills/integrating-dast-with-owasp-zap-in-pipeline/SKILL.md` |
| 4 | implementing-semgrep-for-custom-sast-rules | Custom Semgrep rules untuk Next.js/React | `../../Anthropic-Cybersecurity-Skills/skills/implementing-semgrep-for-custom-sast-rules/SKILL.md` |
| 5 | implementing-secret-scanning-with-gitleaks | Scan `GEMINI_API_KEY`, Supabase keys di git history | `../../Anthropic-Cybersecurity-Skills/skills/implementing-secret-scanning-with-gitleaks/SKILL.md` |
| 6 | securing-github-actions-workflows | Jika ada GitHub Actions workflows | `../../Anthropic-Cybersecurity-Skills/skills/securing-github-actions-workflows/SKILL.md` |
| 7 | implementing-secrets-scanning-in-ci-cd | Pre-commit & CI secret scanning | `../../Anthropic-Cybersecurity-Skills/skills/implementing-secrets-scanning-in-ci-cd/SKILL.md` |
| 8 | implementing-secrets-management-with-vault | Vault untuk `GEMINI_API_KEY` & Supabase keys | `../../Anthropic-Cybersecurity-Skills/skills/implementing-secrets-management-with-vault/SKILL.md` |
| 9 | implementing-fuzz-testing-in-cicd-with-aflplusplus | Fuzz testing di CI/CD | `../../Anthropic-Cybersecurity-Skills/skills/implementing-fuzz-testing-in-cicd-with-aflplusplus/SKILL.md` |
| 10 | implementing-github-advanced-security-for-code-scanning | GitHub Advanced Security untuk repo | `../../Anthropic-Cybersecurity-Skills/skills/implementing-github-advanced-security-for-code-scanning/SKILL.md` |
| 11 | building-devsecops-pipeline-with-gitlab-ci | Jika migrasi ke GitLab CI | `../../Anthropic-Cybersecurity-Skills/skills/building-devsecops-pipeline-with-gitlab-ci/SKILL.md` |

---

## 7. Cloud Security (Vercel / Supabase)

> **Konteks project:** Deploy di Vercel (`.vercel/`), database & auth di Supabase cloud, `GEMINI_API_KEY` sebagai env var Vercel.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | implementing-cloud-security-posture-management | CSPM untuk Vercel + Supabase | `../../Anthropic-Cybersecurity-Skills/skills/implementing-cloud-security-posture-management/SKILL.md` |
| 2 | auditing-cloud-with-cis-benchmarks | CIS benchmark untuk cloud config | `../../Anthropic-Cybersecurity-Skills/skills/auditing-cloud-with-cis-benchmarks/SKILL.md` |
| 3 | conducting-cloud-incident-response | IR playbook untuk Vercel/Supabase breach | `../../Anthropic-Cybersecurity-Skills/skills/conducting-cloud-incident-response/SKILL.md` |
| 4 | implementing-cloud-waf-rules | WAF rules untuk Vercel/Cloudflare | `../../Anthropic-Cybersecurity-Skills/skills/implementing-cloud-waf-rules/SKILL.md` |
| 5 | implementing-ddos-mitigation-with-cloudflare | DDoS mitigation untuk portfolio domain | `../../Anthropic-Cybersecurity-Skills/skills/implementing-ddos-mitigation-with-cloudflare/SKILL.md` |
| 6 | implementing-cloud-trail-log-analysis | Audit log analysis Supabase | `../../Anthropic-Cybersecurity-Skills/skills/implementing-cloud-trail-log-analysis/SKILL.md` |
| 7 | detecting-shadow-it-cloud-usage | Shadow IT detection untuk SaaS (Gemini, Supabase) | `../../Anthropic-Cybersecurity-Skills/skills/detecting-shadow-it-cloud-usage/SKILL.md` |

---

## 8. Vulnerability Management

> **Konteks project:** Tidak ada SCA/SAST tool terlihat. Dependencies: `@google/genai`, `@supabase/*`, `next`, `react`, `framer-motion`, dll. Perlu scan `npm audit` + Snyk + CVE prioritization.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | performing-sca-dependency-scanning-with-snyk | SCA scan `package.json` dengan Snyk | `../../Anthropic-Cybersecurity-Skills/skills/performing-sca-dependency-scanning-with-snyk/SKILL.md` |
| 2 | prioritizing-vulnerabilities-with-cvss-scoring | CVSS scoring untuk vulnerabilities | `../../Anthropic-Cybersecurity-Skills/skills/prioritizing-vulnerabilities-with-cvss-scoring/SKILL.md` |
| 3 | performing-cve-prioritization-with-kev-catalog | Prioritisasi berdasar CISA KEV | `../../Anthropic-Cybersecurity-Skills/skills/performing-cve-prioritization-with-kev-catalog/SKILL.md` |
| 4 | triaging-vulnerabilities-with-ssvc-framework | SSVC decision framework | `../../Anthropic-Cybersecurity-Skills/skills/triaging-vulnerabilities-with-ssvc-framework/SKILL.md` |
| 5 | implementing-epss-score-for-vulnerability-prioritization | EPSS score untuk exploit likelihood | `../../Anthropic-Cybersecurity-Skills/skills/implementing-epss-score-for-vulnerability-prioritization/SKILL.md` |
| 6 | performing-vulnerability-scanning-with-nessus | Nessus scan Vercel/deployment | `../../Anthropic-Cybersecurity-Skills/skills/performing-vulnerability-scanning-with-nessus/SKILL.md` |
| 7 | performing-authenticated-vulnerability-scan | Authenticated scan (login admin) | `../../Anthropic-Cybersecurity-Skills/skills/performing-authenticated-vulnerability-scan/SKILL.md` |
| 8 | performing-agentless-vulnerability-scanning | Agentless scan untuk Vercel | `../../Anthropic-Cybersecurity-Skills/skills/performing-agentless-vulnerability-scanning/SKILL.md` |
| 9 | building-vulnerability-scanning-workflow | Workflow scanning berulang | `../../Anthropic-Cybersecurity-Skills/skills/building-vulnerability-scanning-workflow/SKILL.md` |
| 10 | implementing-vulnerability-remediation-sla | SLA remediasi berdasar severity | `../../Anthropic-Cybersecurity-Skills/skills/implementing-vulnerability-remediation-sla/SKILL.md` |

---

## 9. Cryptography (TLS / JWT / Encryption)

> **Konteks project:** Vercel auto-TLS, Supabase JWT signing, `GEMINI_API_KEY` storage, cookies HttpOnly. Perlu verifikasi TLS config & JWT algorithm.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | configuring-tls-1-3-for-secure-communications | Verifikasi TLS 1.3 di Vercel domain | `../../Anthropic-Cybersecurity-Skills/skills/configuring-tls-1-3-for-secure-communications/SKILL.md` |
| 2 | performing-ssl-tls-security-assessment | SSL Labs scan portfolio domain | `../../Anthropic-Cybersecurity-Skills/skills/performing-ssl-tls-security-assessment/SKILL.md` |
| 3 | auditing-tls-certificate-transparency-logs | CT log monitoring untuk domain | `../../Anthropic-Cybersecurity-Skills/skills/auditing-tls-certificate-transparency-logs/SKILL.md` |
| 4 | implementing-aes-encryption-for-data-at-rest | Enkripsi data sensitif di Supabase | `../../Anthropic-Cybersecurity-Skills/skills/implementing-aes-encryption-for-data-at-rest/SKILL.md` |
| 5 | implementing-digital-signatures-with-ed25519 | Signing untuk build artifacts | `../../Anthropic-Cybersecurity-Skills/skills/implementing-digital-signatures-with-ed25519/SKILL.md` |
| 6 | performing-cryptographic-audit-of-application | Audit crypto usage (JWT, cookies, API keys) | `../../Anthropic-Cybersecurity-Skills/skills/performing-cryptographic-audit-of-application/SKILL.md` |
| 7 | performing-ssl-certificate-lifecycle-management | Certificate lifecycle untuk domain | `../../Anthropic-Cybersecurity-Skills/skills/performing-ssl-certificate-lifecycle-management/SKILL.md` |

---

## 10. Compliance & Privacy (Data User / IP Logs)

> **Konteks project:** `ai_chat_logs` menyimpan `user_ip` + `prompt_preview` + tokens. Contact form menyimpan pesan user. Data user Indonesia (UU PDP berlaku 2024). Perlu privacy impact assessment & data subject access request workflow.

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | conducting-gdpr-compliance-assessment | GDPR/UU PDP assessment untuk data user | `../../Anthropic-Cybersecurity-Skills/skills/conducting-gdpr-compliance-assessment/SKILL.md` |
| 2 | implementing-gdpr-data-protection-controls | Data protection controls (minimize IP logging) | `../../Anthropic-Cybersecurity-Skills/skills/implementing-gdpr-data-protection-controls/SKILL.md` |
| 3 | performing-privacy-impact-assessment | PIA untuk chatbot + contact form | `../../Anthropic-Cybersecurity-Skills/skills/performing-privacy-impact-assessment/SKILL.md` |
| 4 | managing-third-party-vendor-risk | Vendor risk: Vercel, Supabase, Google Gemini | `../../Anthropic-Cybersecurity-Skills/skills/managing-third-party-vendor-risk/SKILL.md` |
| 5 | conducting-cyber-risk-assessment-with-nist-800-30 | Risk assessment NIST 800-30 | `../../Anthropic-Cybersecurity-Skills/skills/conducting-cyber-risk-assessment-with-nist-800-30/SKILL.md` |
| 6 | implementing-gdpr-data-subject-access-request | DSAR workflow untuk user data | `../../Anthropic-Cybersecurity-Skills/skills/implementing-gdpr-data-subject-access-request/SKILL.md` |

---

## 11. Threat Modeling & Incident Response

> **Konteks project:** Perlu threat modeling sebelum pentest dan IR playbook jika terjadi breach (chatbot disalahgunakan, admin account compromised, data leak via RAG).

| # | Skill | Relevansi Project | Path |
|---|---|---|---|
| 1 | performing-threat-modeling-with-owasp-threat-dragon | Threat modeling diagram dengan Threat Dragon | `../../Anthropic-Cybersecurity-Skills/skills/performing-threat-modeling-with-owasp-threat-dragon/SKILL.md` |
| 2 | implementing-threat-modeling-with-mitre-attack | Threat modeling dengan MITRE ATT&CK | `../../Anthropic-Cybersecurity-Skills/skills/implementing-threat-modeling-with-mitre-attack/SKILL.md` |
| 3 | building-incident-response-playbook | IR playbook untuk breach scenario | `../../Anthropic-Cybersecurity-Skills/skills/building-incident-response-playbook/SKILL.md` |
| 4 | triaging-security-incident | Triage incident (chatbot abuse, admin compromise) | `../../Anthropic-Cybersecurity-Skills/skills/triaging-security-incident/SKILL.md` |
| 5 | containing-active-breach | Breach containment steps | `../../Anthropic-Cybersecurity-Skills/skills/containing-active-breach/SKILL.md` |

---

## Quick-Reference Checklist (Prioritas Keamanan)

Urutan rekomendasi eksekusi (high → low impact):

### Priority 1 — Critical (Week 1)
- [ ] **AI Prompt Injection** — Test `src/app/api/chat/route.ts` dengan `testing-prompt-injection-in-rag-pipelines` & `testing-for-system-prompt-leakage`
- [ ] **System Prompt Leakage** — Verifikasi `buildSystemPrompt()` di `src/lib/rag-context.ts:126` tidak bisa di-extract
- [ ] **Secret Scanning** — Jalankan `implementing-secret-scanning-with-gitleaks` untuk `.env.local` & git history
- [ ] **Rate Limiting** — Tambah rate limit di `/api/chat` (`implementing-api-rate-limiting-and-throttling`) untuk cegah Gemini API abuse
- [ ] **SSRF di `/api/images`** — Test dengan `performing-ssrf-vulnerability-exploitation` & `exploiting-server-side-request-forgery`

### Priority 2 — High (Week 2)
- [ ] **XSS via Markdown** — Audit `react-markdown` di `testing-for-xss-vulnerabilities` (tambah `rehype-sanitize`)
- [ ] **Broken Access Control** — Test admin server actions dengan `testing-for-broken-access-control` & `exploiting-idor-vulnerabilities`
- [ ] **JWT Security** — Audit Supabase JWT dengan `testing-jwt-token-security`
- [ ] **Security Headers** — Audit dengan `performing-security-headers-audit` (CSP, HSTS, X-Frame-Options) di `next.config.ts`
- [ ] **CORS** — Test API routes dengan `testing-cors-misconfiguration`

### Priority 3 — Medium (Week 3)
- [ ] **SCA Scan** — Jalankan `performing-sca-dependency-scanning-with-snyk` untuk `package.json`
- [ ] **NPM Malicious Package** — Triase `package-lock.json` dengan `detecting-malicious-npm-packages`
- [ ] **Dependency Confusion** — Cek dengan `detecting-dependency-confusion`
- [ ] **SAST Integration** — Setup Semgrep dengan `implementing-semgrep-for-custom-sast-rules`
- [ ] **CSRF** — Test contact form dengan `performing-csrf-attack-simulation`

### Priority 4 — Low (Week 4)
- [ ] **TLS Assessment** — Scan domain dengan `performing-ssl-tls-security-assessment`
- [ ] **Privacy Compliance** — PIA dengan `performing-privacy-impact-assessment` (IP logging di `ai_chat_logs`)
- [ ] **Threat Model** — Diagram dengan `performing-threat-modeling-with-owasp-threat-dragon`
- [ ] **IR Playbook** — Buat dengan `building-incident-response-playbook`
- [ ] **CVE Prioritization** — Setup `performing-cve-prioritization-with-kev-catalog`

---

## Catatan

- **Total skill terkurasi: 114** dari 818 skill yang tersedia di repo Anthropic-Cybersecurity-Skills.
- **Domain yang sengaja dikecualikan** karena tidak relevan dengan project ini: Malware Analysis, Digital Forensics, Network Security (IDS/firewall fisik), OT/ICS, Mobile Security, Red Teaming C2, Container/K8s, Deception Technology, Hardware/Firmware, Ransomware, Wireless, Blockchain, Purple Team, Endpoint Security, Phishing Defense (email-level), Container Security.
- **Repo skill** berada di sibling folder: `D:\AL FITRA\GITHUB\Anthropic-Cybersecurity-Skills` (di-clone dari https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git). Path relatif dari root project: `../../Anthropic-Cybersecurity-Skills/skills/<name>/SKILL.md`.
- **Setiap skill** memiliki struktur: `SKILL.md` (frontmatter + workflow) + `references/` (standards, workflows, api-reference) + opsional `scripts/` + `assets/`.
- **Framework mapping**: Skill-skill ini dipetakan ke MITRE ATT&CK v19.1, NIST CSF 2.0, MITRE ATLAS, MITRE D3FEND, NIST AI RMF, dan MITRE F3.
- **License**: Skill library berlisensi Apache-2.0. Gunakan sesuai aturan authorized-use-only.

---

*File ini di-generate untuk project `portfolio-v3` — Al Fitra Nur Ramadhani. Update jika ada perubahan stack atau attack surface baru.*
