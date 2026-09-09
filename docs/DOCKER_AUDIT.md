<!-- cspell:disable -->
# Audit Docker — Portfolio v3

> **Tanggal audit:** 9 September 2026
> **Tanggal eksekusi:** 9 September 2026
> **Status containerization:** ✅ Production-grade (build pass, container healthy, CI aktif)
> **Deployment saat ini:** Vercel (production) + Docker (self-host/backup)

---

## Daftar Isi

- [Bagian 1 — Yang Sudah Dilakukan](#bagian-1--yang-sudah-dilakukan)
- [Bagian 2 — Bug yang Ditemukan & Diperbaiki](#bagian-2--bug-yang-ditemukan--diperbaiki)
- [Bagian 3 — Yang Kurang untuk Standar Profesional](#bagian-3--yang-kurang-untuk-standar-profesional)
- [Bagian 4 — Cara Pakai Docker](#bagian-4--cara-pakai-docker)
- [Bagian 5 — File Inventory](#bagian-5--file-inventory-final-state)
- [Bagian 6 — CI/CD Pipeline](#bagian-6--cicd-pipeline)
- [Bagian 7 — Next Steps (Opsional)](#bagian-7--next-steps-opsional)

---

## Bagian 1 — Yang Sudah Dilakukan

### Tahap 1: Foundation (Selesai)

| File | Aksi | Detail |
|---|---|---|
| `.nvmrc` | Dibuat | Pin Node 20 LTS |
| `next.config.ts` | Diedit | Tambah `output: 'standalone'` (line 4) |
| `src/app/api/health/route.ts` | Dibuat | Endpoint `{ status: 'ok', timestamp }` |
| `playwright.config.ts` | Diedit | Hapus hardcoded `executablePath` (line 30-31) |

### Tahap 2: Docker Files (Selesai)

| File | Aksi | Detail |
|---|---|---|
| `Dockerfile` | Dibuat | Multi-stage: base → deps → builder → runner |
| `.dockerignore` | Dibuat | Eksklusi node_modules, .next, .env, .git, tests, docs |
| `docker-compose.yml` | Dibuat | Service web, port 3000, env_file, build args, resource limits, log rotation |
| `.env` | Dibuat | Template dari `.env.example` (perlu diisi nilai asli) |

### Tahap 3: Dev Mode (Selesai)

| File | Aksi | Detail |
|---|---|---|
| `docker-compose.override.yml` | Dibuat | Dev mode: target builder, npm run dev, volume mounts |

### Tahap 4: CI/CD (Selesai)

| File | Aksi | Detail |
|---|---|---|
| `.github/workflows/docker-build.yml` | Dibuat | GitHub Actions: build + push ke GHCR + Trivy scan |
| `README.md` | Diedit | Tambah section Docker (prod + dev instructions) |

### Production Hardening (Selesai)

| Fitur | Lokasi | Detail |
|---|---|---|
| Resource limits | `docker-compose.yml` | 512M memory, 0.5 CPU, 256M reservation |
| Log rotation | `docker-compose.yml` | json-file, max 10m x 3 files |
| npm install hardening | `Dockerfile` | `--ignore-scripts` (supply chain protection) |
| CI push ke GHCR | `docker-build.yml` | `latest` + git SHA tags |
| Trivy security scan | `docker-build.yml` | CRITICAL,HIGH, exit-code 1 |
| GHA cache | `docker-build.yml` | `cache-from/cache-to: type=gha` |

### Git History Cleanup (Selesai)

- Password `bookfacepepabri11` dan email `alfitranurr@gmail.com` dihapus dari 154 commits
- Pakai `git filter-repo` → replace jadi `REDACTED_PASSWORD` / `REDACTED_EMAIL`
- Email publik di `contact/page.tsx` dipulihkan (commit `179249b`)
- Force push ke GitHub berhasil
- Final scan: **CLEAN** — tidak ada secrets di seluruh git history

### Hasil Test Build & Run (Selesai)

| Metric | Hasil |
|---|---|
| Docker build | ✅ Sukses |
| Image size | 279MB |
| Container status | `Up (healthy)` |
| Health endpoint | `{"status":"ok"}` |
| Healthcheck pass | Setelah ~40s (start-period 15s + interval 30s) |

---

## Bagian 2 — Bug yang Ditemukan & Diperbaiki

### Bug Awal (Ditemukan Sebelum Eksekusi)

| Bug | Dampak | Fix |
|---|---|---|
| `.dockerignore` exclude `package-lock.json` | `npm ci` gagal | Hapus `package-lock.json` dari `.dockerignore` |
| Dockerfile `deps` pakai `--omit=dev` | Build gagal (typescript, tailwind di devDeps) | Ubah ke `npm ci` tanpa `--omit=dev` |
| `NEXT_PUBLIC_*` tidak di-pass sebagai build ARG | Supabase client tidak jalan di image | Tambah `ARG` + `ENV` di builder, `args` di compose |
| `wget --no-verbose` (GNU wget flag) | HEALTHCHECK fail di BusyBox Alpine | Ganti ke `wget --spider -q` |
| Healthcheck duplikat (Dockerfile + compose) | Redundan | Hapus dari Dockerfile, simpan di compose |

### Bug Tambahan (Ditemukan Saat Test Build & Run)

| Bug | Penyebab | Fix |
|---|---|---|
| `npm ci` gagal: Missing `@emnapi/runtime`, `@emnapi/core` | Lockfile di-generate di Windows, tidak include Linux optional deps (`@tailwindcss/oxide-wasm32-wasi`, `@img/sharp-wasm32`) | Ganti `npm ci` → `npm install` (resolve platform-specific optional deps) |
| Healthcheck "Connection refused" | Alpine `localhost` resolve ke IPv6 `::1`, tapi server listen di IPv4 `0.0.0.0` | Ganti `localhost` → `127.0.0.1` di healthcheck command |
| `npm@latest` (v12) butuh Node 22+ | `npm install -g npm@latest` di `node:20-alpine` fail (EBADENGINE) | Tidak perlu upgrade npm — `npm install` (tanpa ci) sudah handle cross-platform |

---

## Bagian 3 — Yang Kurang untuk Standar Profesional

### Prioritas Sedang (Production Enhancement)

#### 3.1 Reverse Proxy + HTTPS

**Gunanya:** Container jalan di port 3000, production butuh 443 + SSL certificate. Reverse proxy (Caddy paling mudah — auto HTTPS) terima 443, forward ke 3000.

**File baru:** `Caddyfile` + service `caddy` di compose.

**Caddyfile:**
```caddy
alfitranurr.example.com {
    reverse_proxy web:3000
}
```

**docker-compose.yml (tambah service):**
```yaml
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - web
    restart: unless-stopped

volumes:
  caddy_data:
```

---

### Prioritas Rendah (Nice-to-Have)

#### 3.2 Image Label

**Gunanya:** Metadata image untuk traceability.

```dockerfile
LABEL org.opencontainers.image.title="Portfolio v3" \
      org.opencontainers.image.source="https://github.com/alfitranurr/portfolio-v3" \
      org.opencontainers.image.licenses="proprietary"
```

#### 3.3 Digest Pinning

**Gunanya:** Reproducibility, mencegah supply chain surprise (base image berubah tanpa sepengetahuan).

```dockerfile
FROM node:20-alpine@sha256:<digest> AS base
```

**Cara dapat digest:**
```bash
docker buildx imagetools inspect node:20-alpine --format "{{.Manifest.Digest}}"
```

#### 3.4 Multi-Arch Build

**Gunanya:** Support ARM server (AWS Graviton, Raspberry Pi) selain x86.

```yaml
platforms: linux/amd64,linux/arm64
```

---

## Bagian 4 — Cara Pakai Docker

### Prasyarat

1. Docker Desktop / Docker Engine terinstall
2. `.env` sudah diisi dengan nilai asli (bukan placeholder)
3. Port 3000 tidak dipakai aplikasi lain

### Production Mode

```bash
# Copy env template & isi nilai asli
cp .env.example .env
# Edit .env dengan Supabase URL, anon key, Gemini API key, admin credentials

# Build & jalankan (override file diabaikan dengan -f)
docker compose -f docker-compose.yml up -d

# Cek status
docker compose ps

# Cek health status (harus "healthy" setelah ~40s)
docker inspect --format='{{.State.Health.Status}}' portfolio-v3-web-1

# Lihat logs
docker compose logs -f web

# Stop
docker compose -f docker-compose.yml down
```

### Development Mode (Hot Reload)

```bash
# docker-compose.override.yml auto-merge dengan docker-compose.yml
docker compose up

# Akses di http://localhost:3000
# Perubahan kode auto-reload (volume mount aktif)
```

### Akses

| Endpoint | URL |
|---|---|
| Web | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |

### Image Details

| Feature | Detail |
|---|---|
| Base image | `node:20-alpine` |
| Build | Multi-stage (base → deps → builder → runner) |
| Image size | ~279MB (standalone output) |
| User | Non-root (`nextjs:nodejs`, uid 1001) |
| Health check | `/api/health` setiap 30s via `127.0.0.1` |
| Port | 3000 (host:container) |
| Resource limits | 512M memory, 0.5 CPU |
| Log rotation | json-file, max 10m x 3 files |

### Kompatibilitas Vercel

- Dockerfile tidak mengganggu deploy Vercel — Vercel tetap bisa build dari `package.json` seperti biasa
- `output: 'standalone'` tidak berefek ke Vercel (Vercel punya build system sendiri)
- Keduanya bisa berjalan paralel: Vercel untuk production, Docker untuk self-hosting/testing

---

## Bagian 5 — File Inventory (Final State)

| File | Status | Perlu Diedit? |
|---|---|---|
| `.nvmrc` | ✅ Selesai | Tidak |
| `next.config.ts` | ✅ Selesai | Tidak |
| `src/app/api/health/route.ts` | ✅ Selesai | Tidak |
| `playwright.config.ts` | ✅ Selesai | Tidak |
| `.dockerignore` | ✅ Selesai | Tidak |
| `.env` | ⚠️ Perlu diisi nilai asli | Ya (isi sebelum build) |
| `Dockerfile` | ✅ Selesai (multi-stage, non-root, --ignore-scripts) | Tidak |
| `docker-compose.yml` | ✅ Selesai (limits, log rotation, healthcheck) | Tidak |
| `docker-compose.override.yml` | ✅ Selesai | Tidak |
| `.github/workflows/docker-build.yml` | ✅ Selesai (push GHCR + Trivy) | Tidak |
| `README.md` | ✅ Selesai | Tidak |

---

## Bagian 6 — CI/CD Pipeline

### Workflow: Build & Push Docker Image

**Trigger:** Push atau PR ke `master` branch

**Steps:**
1. Checkout code
2. Setup Docker Buildx
3. Login ke GHCR (hanya saat push, bukan PR)
4. Build & push image dengan tags:
   - `ghcr.io/alfitranurr/portfolio-v3:latest` (pointer ke versi terbaru)
   - `ghcr.io/alfitranurr/portfolio-v3:{git-sha}` (immutable, untuk rollback)
5. Trivy security scan (hanya saat push) — fail jika ada CRITICAL/HIGH CVE

**Permissions yang dibutuhkan:**
- `contents: read` — untuk checkout
- `packages: write` — untuk push ke GHCR

**Setup GitHub (sekali):**
- Repo Settings → Actions → General → Workflow permissions = "Read and write permissions"
- `GITHUB_TOKEN` otomatis tersedia (tidak perlu buat secret manual)

### Registry: GHCR (GitHub Container Registry)

**URL:** `ghcr.io/alfitranurr/portfolio-v3`

**Tag strategi:**
```
ghcr.io/alfitranurr/portfolio-v3:latest          # pointer ke versi terbaru
ghcr.io/alfitranurr/portfolio-v3:abc1234         # git SHA (immutable, untuk rollback)
```

**Pull image dari server:**
```bash
docker pull ghcr.io/alfitranurr/portfolio-v3:latest
docker run -d -p 3000:3000 --env-file .env ghcr.io/alfitranurr/portfolio-v3:latest
```

---

## Bagian 7 — Next Steps (Opsional)

### Step 1: Deploy ke VPS dengan Docker (Prioritas Sedang)

Jika mau deploy ke VPS (selain Vercel):

1. **Setup VPS:**
   ```bash
   # Di VPS
   apt install docker.io docker-compose
   docker login ghcr.io -u USERNAME -p GITHUB_PAT
   ```

2. **Pull & run:**
   ```bash
   docker pull ghcr.io/alfitranurr/portfolio-v3:latest
   docker run -d -p 3000:3000 --env-file .env --name portfolio ghcr.io/alfitranurr/portfolio-v3:latest
   ```

3. **Cek health:**
   ```bash
   docker inspect --format='{{.State.Health.Status}}' portfolio
   ```

### Step 2: Reverse Proxy + HTTPS (Prioritas Sedang)

Tambah Caddy sebagai reverse proxy untuk HTTPS otomatis (Let's Encrypt). Lihat Bagian 3.1 untuk konfigurasi.

### Step 3: Auto-update dengan Watchtower (Prioritas Rendah)

Watchtower auto-pull image baru dari GHCR dan restart container:
```yaml
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=3600
```

### Step 4: Image Label & Digest Pinning (Prioritas Rendah)

Lihat Bagian 3.2 dan 3.3.

### Step 5: Multi-Arch Build (Prioritas Rendah)

Support ARM server (AWS Graviton, Raspberry Pi). Lihat Bagian 3.4.
