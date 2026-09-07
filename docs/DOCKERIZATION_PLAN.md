<!-- cspell:disable -->
# Rencana Containerisasi Docker — Portfolio v3

> **Tanggal audit:** 7 September 2026
> **Status:** Belum ter-container sama sekali
> **Deployment saat ini:** Vercel (`.vercel/project.json`)

---

## 1. Hasil Audit

### 1.1 Checklist File

| File | Status | Catatan |
|---|---|---|
| `Dockerfile` | ❌ Tidak ada | — |
| `docker-compose.yml` | ❌ Tidak ada | — |
| `.dockerignore` | ❌ Tidak ada | — |
| `.nvmrc` / `.node-version` | ❌ Tidak ada | Node version tidak di-pin |
| `.github/workflows/` | ❌ Tidak ada | Tidak ada CI/CD pipeline |
| `vercel.json` | ❌ Tidak ada | Deploy via Vercel dashboard |
| `.env.example` | ✅ Ada | Template env vars lengkap |
| `.env.local` | ✅ Ada | Env vars aktif (local dev) |
| `next.config.ts` | ✅ Ada | Belum set `output: 'standalone'` |
| `.vercel/project.json` | ✅ Ada | Deploy target Vercel |

### 1.2 Masalah Portabilitas yang Ditemukan

#### 1.2.1 Node Version Tidak Di-Pin
- **Lokasi:** `package.json` — `@types/node: ^20`
- **Masalah:** Tidak ada `.nvmrc` atau `.node-version`. Di laptop bisa jalan Node 20, di server bisa Node 22 → behavior beda (API berubah, deprecated warnings, performance berbeda).
- **Solusi:** Buat `.nvmrc` dengan pin ke `20.x`.

#### 1.2.2 Playwright Config Hardcoded Path
- **Lokasi:** `playwright.config.ts:32`
- **Kode:**
  ```ts
  executablePath:
    'C:\\Users\\HYPE-R FLIP\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
  ```
- **Masalah:** Path absolut hanya jalan di laptop kamu. Di komputer/server lain akan error `executable path does not exist`.
- **Solusi:** Hapus `executablePath`, biarkan Playwright pakai default chromium. Atau pakai environment variable dengan fallback.

#### 1.2.3 Next.js `output: 'standalone'` Belum Diaktifkan
- **Lokasi:** `next.config.ts`
- **Masalah:** Tanpa `output: 'standalone'`, Docker image harus copy seluruh `node_modules` (~500MB-1GB). Dengan standalone, Next.js bundle hanya yang dibutuhkan (~150MB).
- **Solusi:** Tambahkan `output: 'standalone'` di `next.config.ts`.

#### 1.2.4 Tidak Ada Health Check Endpoint
- **Masalah:** Docker `HEALTHCHECK` butuh endpoint untuk dicek. Tidak ada `/api/health` atau sejenisnya.
- **Solusi:** Buat endpoint sederhana `/api/health` yang return `{ status: 'ok' }`.

#### 1.2.5 Env Vars Hanya di `.env.local`
- **Masalah:** `.env.local` tidak boleh di-commit ke git (dan sudah di `.gitignore`). Di container, env vars perlu di-inject via `docker-compose.yml` atau `docker run -e`.
- **Solusi:** Buat `docker-compose.yml` dengan env vars dari `.env.example` sebagai template, dan `.env` (tidak di-commit) untuk nilai asli.

#### 1.2.6 CSP Header `connect-src` Membatasi API Eksternal
- **Lokasi:** `next.config.ts:39`
- **Kode:**
  ```ts
  "connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co",
  ```
- **Masalah:** Jika AI chat atau fitur lain memanggil API dari domain selain yang terdaftar, akan di-block oleh CSP. Perlu verifikasi semua domain sudah tercantum.
- **Solusi:** Audit semua API calls, pastikan domainnya ada di CSP. Tidak blocking untuk Docker, tapi perlu dicek.

---

## 2. Tahap 1 — Foundation

> **Estimasi waktu:** ~30 menit
> **Prioritas:** Tinggi (prasyarat untuk Docker)

### 2.1 Buat `.nvmrc`
```bash
# Pin Node version ke 20 (LTS)
20
```

### 2.2 Aktifkan `output: 'standalone'` di `next.config.ts`
```ts
const nextConfig: NextConfig = {
  output: 'standalone',  // <-- tambahkan ini
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // ... rest tetap sama
};
```

**Efek:** `npm run build` akan menghasilkan folder `.next/standalone/` yang berarti server Next.js + dependencies yang dibutuhkan saja, tanpa perlu `node_modules` penuh.

### 2.3 Buat Endpoint `/api/health`
**File:** `src/app/api/health/route.ts`
```ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

### 2.4 Fix `playwright.config.ts`
**Sebelum:**
```ts
launchOptions: {
  executablePath:
    'C:\\Users\\HYPE-R FLIP\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
},
```

**Sesudah:**
```ts
// Hapus executablePath, biarkan Playwright pakai default chromium
launchOptions: {},
```

---

## 3. Tahap 2 — Docker Files

> **Estimasi waktu:** ~1 jam
> **Prioritas:** Tinggi (inti containerisasi)
> **Prasyarat:** Tahap 1 selesai

### 3.1 Buat `Dockerfile` (Multi-Stage)

```dockerfile
# ==================== Stage 1: Base ====================
FROM node:20-alpine AS base
WORKDIR /app

# ==================== Stage 2: Dependencies ====================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ==================== Stage 3: Builder ====================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ==================== Stage 4: Runner ====================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output dari builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

**Catatan:**
- Multi-stage build: image final hanya ~150MB (vs ~1GB tanpa standalone)
- User non-root (`nextjs:nodejs`) untuk keamanan
- `HEALTHCHECK` otomatis cek `/api/health` setiap 30 detik
- `HOSTNAME=0.0.0.0` agar container bisa diakses dari host

### 3.2 Buat `.dockerignore`

```gitignore
# Dependencies
node_modules
package-lock.json

# Next.js build output
.next
out

# Git
.git
.gitignore

# Environment
.env
.env.local
.env.*.local

# Testing
test-results
playwright-report
tests

# IDE
.vscode
.idea

# OS
.DS_Store
Thumbs.db

# Docs (tidak perlu di image production)
docs
*.md
SECURITY_SKILLS_PROMPT.md
implementation_plan.md
PROGRESS.md

# Vercel
.vercel

# Misc
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
tsconfig.tsbuildinfo
```

### 3.3 Buat `docker-compose.yml`

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      start_period: 15s
      retries: 3
```

### 3.4 Buat `.env` (template, tidak di-commit)

```bash
# Copy dari .env.example, isi dengan nilai asli
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-api-key
GEMINI_API_KEY=your-gemini-api-key
ADMIN_MOCK_EMAIL=admin@example.com
ADMIN_MOCK_PASSWORD=admin-password-here
```

**Tambahkan `.env` ke `.gitignore`** (jika belum ada).

---

## 4. Tahap 3 — Fix Portabilitas & Dev Mode

> **Estimasi waktu:** ~30 menit
> **Prioritas:** Sedang
> **Prasyarat:** Tahap 2 selesai

### 4.1 `docker-compose.override.yml` (Dev Mode dengan Hot Reload)

```yaml
services:
  web:
    build:
      target: builder  # Build sampai stage builder saja
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_TELEMETRY_DISABLED=1
    ports:
      - "3000:3000"
```

**Cara pakai:**
```bash
# Dev mode (auto merge dengan docker-compose.yml)
docker compose up

# Production mode (override file diabaikan dengan -f)
docker compose -f docker-compose.yml up -d
```

### 4.2 Verifikasi Playwright di Docker

Playwright butuh browser dependencies di Alpine. Tambahkan ke `Dockerfile` (dev stage):

```dockerfile
# Hanya jika ingin run tests di Docker
RUN npx playwright install --with-deps chromium
```

**Catatan:** Tests biasanya tetap dijalankan di local/CI, tidak di production container.

---

## 5. Tahap 4 — Ops & CI/CD (Opsional)

> **Estimasi waktu:** ~1-2 jam
> **Prioritas:** Rendah
> **Prasyarat:** Tahap 1-3 selesai

### 5.1 GitHub Actions CI Pipeline

**File:** `.github/workflows/docker-build.yml`

```yaml
name: Build & Push Docker Image

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: false
          tags: portfolio-v3:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 5.2 Update `README.md`

Tambahkan section "Docker" dengan instruksi:

```markdown
## Docker

### Production
```bash
# Copy env template
cp .env.example .env
# Edit .env dengan nilai asli

# Build & jalankan
docker compose -f docker-compose.yml up -d
```

### Development (hot reload)
```bash
docker compose up
```

### Akses
- Web: http://localhost:3000
- Health check: http://localhost:3000/api/health
```

---

## 6. Urutan Eksekusi & Checklist

| Tahap | Estimasi | Status | Items |
|---|---|---|---|
| **1. Foundation** | ~30 menit | ⬜ Belum mulai | `.nvmrc`, `output: standalone`, `/api/health`, fix Playwright |
| **2. Docker Files** | ~1 jam | ⬜ Belum mulua | `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.env` |
| **3. Dev Mode & Portabilitas** | ~30 menit | ⬜ Belum mulai | `docker-compose.override.yml`, verify Playwright |
| **4. Ops & CI/CD** | ~1-2 jam | ⬜ Belum mulai | GitHub Actions, `README.md` update |

---

## 7. Ringkasan Masalah → Solusi

| # | Masalah | Solusi | Tahap |
|---|---|---|---|
| 1 | Node version tidak di-pin | Buat `.nvmrc` dengan `20` | 1 |
| 2 | Playwright hardcoded path | Hapus `executablePath` | 1 |
| 3 | Next.js belum standalone | Set `output: 'standalone'` | 1 |
| 4 | Tidak ada health endpoint | Buat `/api/health` | 1 |
| 5 | Tidak ada Dockerfile | Buat multi-stage Dockerfile | 2 |
| 6 | Tidak ada `.dockerignore` | Buat `.dockerignore` | 2 |
| 7 | Tidak ada `docker-compose.yml` | Buat compose file | 2 |
| 8 | Env vars hanya di `.env.local` | Template `.env` + compose env_file | 2 |
| 9 | Tidak ada dev mode Docker | `docker-compose.override.yml` | 3 |
| 10 | Tidak ada CI/CD | GitHub Actions (opsional) | 4 |

---

## 8. Catatan Tambahan

### 8.1 Image Size Comparison
| Metode | Ukuran Image |
|---|---|
| Tanpa standalone (copy node_modules) | ~800MB-1GB |
| Dengan standalone | ~150-200MB |
| Dengan standalone + Alpine | ~120-150MB |

### 8.2 Keamanan
- Container jalan sebagai user non-root (`nextjs:nodejs`)
- `.env` tidak di-commit ke git
- `NODE_ENV=production` di-set di compose
- Health check otomatis restart jika unhealthy

### 8.3 Kompatibilitas Vercel
- Dockerfile tidak mengganggu deploy Vercel — Vercel tetap bisa build dari `package.json` seperti biasa
- `output: 'standalone'` tidak berefek ke Vercel (Vercel punya build system sendiri)
- Keduanya bisa berjalan paralel: Vercel untuk production, Docker untuk self-hosting/testing
