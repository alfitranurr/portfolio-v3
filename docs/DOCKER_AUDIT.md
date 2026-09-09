<!-- cspell:disable -->
# Audit Docker — Portfolio v3

> **Tanggal audit:** 9 September 2026
> **Status containerization:** Berfungsi (bisa build & run), tapi belum production-grade
> **Deployment saat ini:** Vercel (production) + Docker (self-host/backup)

---

## Daftar Isi

- [Bagian 1 — Yang Sudah Dilakukan](#bagian-1--yang-sudah-dilakukan)
- [Bagian 2 — Potensi Bug & Masalah](#bagian-2--potensi-bug--masalah)
- [Bagian 3 — Yang Kurang untuk Standar Profesional](#bagian-3--yang-kurang-untuk-standar-profesional)
- [Bagian 4 — Rencana Eksekusi Next Day](#bagian-4--rencana-eksekusi-next-day)
- [Bagian 5 — File Inventory](#bagian-5--file-inventory-final-state)
- [Bagian 6 — Cara Pakai Docker](#bagian-6--cara-pakai-docker)

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
| `docker-compose.yml` | Dibuat | Service web, port 3000, env_file, build args |
| `.env` | Dibuat | Template dari `.env.example` (perlu diisi nilai asli) |

### Tahap 3: Dev Mode (Selesai)

| File | Aksi | Detail |
|---|---|---|
| `docker-compose.override.yml` | Dibuat | Dev mode: target builder, npm run dev, volume mounts |

### Tahap 4: CI/CD (Selesai)

| File | Aksi | Detail |
|---|---|---|
| `.github/workflows/docker-build.yml` | Dibuat | GitHub Actions: build + GHA cache |
| `README.md` | Diedit | Tambah section Docker (prod + dev instructions) |

### Bug Fix Selama Eksekusi (Selesai)

| Bug | Dampak | Fix |
|---|---|---|
| `.dockerignore` exclude `package-lock.json` | `npm ci` gagal | Hapus `package-lock.json` dari `.dockerignore` |
| Dockerfile `deps` pakai `--omit=dev` | Build gagal (typescript, tailwind di devDeps) | Ubah ke `npm ci` tanpa `--omit=dev` |
| `NEXT_PUBLIC_*` tidak di-pass sebagai build ARG | Supabase client tidak jalan di image | Tambah `ARG` + `ENV` di builder, `args` di compose |

### Git History Cleanup (Selesai)

- Password `bookfacepepabri11` dan email `alfitranurr@gmail.com` dihapus dari 154 commits
- Pakai `git filter-repo` → replace jadi `REDACTED_PASSWORD` / `REDACTED_EMAIL`
- Email publik di `contact/page.tsx` dipulihkan (commit `179249b`)
- Force push ke GitHub berhasil
- Final scan: **CLEAN** — tidak ada secrets di seluruh git history

---

## Bagian 2 — Potensi Bug & Masalah

### BUG #1: `wget` BusyBox Tidak Kompatibel (KRITIS)

**Lokasi:** `Dockerfile:49` + `docker-compose.yml:19`

**Kode saat ini:**
```dockerfile
CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

**Masalah:** `node:20-alpine` pakai BusyBox `wget`, bukan GNU wget. Flag `--no-verbose` adalah GNU wget saja — BusyBox tidak mengenalnya. BusyBox wget pakai `-q` untuk quiet.

**Dampak:** HEALTHCHECK akan fail → Docker menandai container "unhealthy" → jika ada orchestrator (Swarm/K8s), container akan terus di-restart. Untuk `docker compose` standalone, container tetap jalan tapi status "unhealthy".

**Solusi:** Ganti dengan BusyBox-compatible command:

```dockerfile
# Opsi A: wget busybox-compatible (Recommended — paling simple)
CMD wget --spider -q http://localhost:3000/api/health || exit 1

# Opsi B: pakai node (paling portabel, node sudah ada di image)
CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
```

**File yang diedit:**
- `Dockerfile` line 49
- `docker-compose.yml` line 19 (healthcheck test command)

---

### BUG #2: Healthcheck Duplikat (RINGAN)

**Lokasi:** `Dockerfile:48-49` + `docker-compose.yml:18-23`

**Masalah:** HEALTHCHECK didefinisikan di Dockerfile DAN di docker-compose.yml. Compose override Dockerfile. Tidak error, tapi redundan.

**Solusi:** Hapus healthcheck di salah satu. Rekomendasi: simpan di `docker-compose.yml` (lebih fleksibel, bisa di-override per environment), hapus dari Dockerfile.

---

### BUG #3: `.env` Placeholder Build Args (PITFALL)

**Lokasi:** `docker-compose.yml:9-10`

**Masalah:** Build args baca dari `${NEXT_PUBLIC_SUPABASE_URL}` yang di-read dari `.env`. Jika `.env` masih berisi placeholder (`your-project-id`), image akan di-build dengan placeholder ter-inlined. Supabase client tidak akan jalan.

**Solusi:** Selalu isi `.env` dengan nilai asli SEBELUM `docker compose build`. Atau tambahkan validasi di CI yang fail build jika detect placeholder.

**Cek sebelum build:**
```bash
# Pastikan .env berisi nilai asli, bukan placeholder
grep -v "your-" .env | grep -v "^#" | grep -v "^$"
```

---

## Bagian 3 — Yang Kurang untuk Standar Profesional

### Prioritas Tinggi (Wajib Sebelum Production)

#### 3.1 Resource Limits

**Gunanya:** Mencegah container makan semua RAM/CPU server.

**Lokasi:** `docker-compose.yml`

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
```

#### 3.2 Log Rotation

**Gunanya:** Mencegah log Docker memenuhi disk server.

**Lokasi:** `docker-compose.yml`

```yaml
services:
  web:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

#### 3.3 npm install Hardening

**Gunanya:** Mencegah malicious npm package jalan install scripts (supply chain attack).

**Lokasi:** `Dockerfile` deps stage (line 9)

```dockerfile
RUN npm ci --ignore-scripts
```

**Catatan:** Cek dulu apakah ada dependency yang butuh install script (esbuild, sharp, dll). Jika ada yang butuh, skip flag ini atau allow per-package.

---

### Prioritas Sedang (Production Enhancement)

#### 3.4 CI Push ke Container Registry

**Gunanya:** CI build image → push ke GHCR (GitHub Container Registry) → server pull image → run. Tidak perlu build di server (lebih cepat, server tidak butuh source code).

**Lokasi:** `.github/workflows/docker-build.yml`

```yaml
- name: Login to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build & Push
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:latest
      ghcr.io/${{ github.repository }}:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Setup sekali di GitHub:**
- `GITHUB_TOKEN` otomatis tersedia di Actions (tidak perlu manual)
- Pastikan repo settings → Actions → General → Workflow permissions = "Read and write"

#### 3.5 Tag Strategi (git SHA + latest)

**Gunanya:** Setiap build punya tag unik (git SHA) untuk rollback & traceability. `latest` untuk pointer ke versi terbaru.

**Format tag:**
```
ghcr.io/alfitranurr/portfolio-v3:latest          # pointer ke versi terbaru
ghcr.io/alfitranurr/portfolio-v3:abc1234         # git SHA (immutable, untuk rollback)
ghcr.io/alfitranurr/portfolio-v3:v1.0.0          # semver (opsional, untuk release)
```

#### 3.6 Trivy Security Scan di CI

**Gunanya:** Scan image untuk CVE (vulnerability di Node.js, Alpine, npm packages) setelah build, sebelum push. Block deploy jika ada critical CVE.

```yaml
- name: Trivy scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}:${{ github.sha }}
    severity: CRITICAL,HIGH
    exit-code: 1
```

#### 3.7 Reverse Proxy + HTTPS

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

#### 3.8 Image Label

**Gunanya:** Metadata image untuk traceability.

```dockerfile
LABEL org.opencontainers.image.title="Portfolio v3" \
      org.opencontainers.image.source="https://github.com/alfitranurr/portfolio-v3" \
      org.opencontainers.image.licenses="proprietary"
```

#### 3.9 Digest Pinning

**Gunanya:** Reproducibility, mencegah supply chain surprise (base image berubah tanpa sepengetahuan).

```dockerfile
FROM node:20-alpine@sha256:<digest> AS base
```

**Cara dapat digest:**
```bash
docker build --pull imagetools inspect node:20-alpine --format "{{.Manifest.Digest}}"
```

#### 3.10 Multi-Arch Build

**Gunanya:** Support ARM server (AWS Graviton, Raspberry Pi) selain x86.

```yaml
platforms: linux/amd64,linux/arm64
```

---

## Bagian 4 — Rencana Eksekusi Next Day

### Urutan Eksekusi (Step by Step)

```
Step 1: Fix Bug #1 (wget BusyBox)           → Dockerfile:49 + docker-compose.yml:19
Step 2: Fix Bug #2 (healthcheck duplikat)   → Hapus HEALTHCHECK dari Dockerfile
Step 3: Tambah Resource Limits              → docker-compose.yml
Step 4: Tambah Log Rotation                 → docker-compose.yml
Step 5: Tambah npm --ignore-scripts         → Dockerfile:9 (test dulu build lulus)
Step 6: CI Push ke GHCR                     → docker-build.yml
Step 7: Tambah Trivy Scan                   → docker-build.yml
Step 8: Test build & run                    → docker compose build && docker compose up
Step 9: Commit & push                        → git add, commit, push
```

### Detail Setiap Step

#### Step 1: Fix Bug #1 (wget BusyBox)

Edit `Dockerfile` line 49:
```dockerfile
# Sebelum:
CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Sesudah:
CMD wget --spider -q http://localhost:3000/api/health || exit 1
```

Edit `docker-compose.yml` line 19:
```yaml
# Sebelum:
test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]

# Sesudah:
test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
```

#### Step 2: Fix Bug #2 (healthcheck duplikat)

Hapus `HEALTHCHECK` dari `Dockerfile` (line 48-49). Simpan di `docker-compose.yml` saja.

```dockerfile
# Hapus baris ini dari Dockerfile:
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

#### Step 3: Tambah Resource Limits di `docker-compose.yml`

```yaml
services:
  web:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
```

#### Step 4: Tambah Log Rotation di `docker-compose.yml`

```yaml
services:
  web:
    # ... existing config ...
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

#### Step 5: Tambah `--ignore-scripts` di Dockerfile

Edit `Dockerfile` line 9:
```dockerfile
# Sebelum:
RUN npm ci

# Sesudah:
RUN npm ci --ignore-scripts
```

**Test dulu:** Setelah edit, jalankan `docker compose build`. Jika build gagal (ada package yang butuh install script), revert dan skip step ini.

#### Step 6: CI Push ke GHCR

Edit `.github/workflows/docker-build.yml` — tambahkan login + push:

```yaml
- name: Login to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build & Push
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:latest
      ghcr.io/${{ github.repository }}:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

#### Step 7: Tambah Trivy Scan di CI

Tambahkan step setelah build:

```yaml
- name: Trivy scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}:${{ github.sha }}
    severity: CRITICAL,HIGH
    exit-code: 1
```

#### Step 8: Test Build & Run

```bash
# Build image
docker compose -f docker-compose.yml build

# Run container
docker compose -f docker-compose.yml up -d

# Cek health status (harus "healthy" setelah ~30s)
docker inspect --format='{{.State.Health.Status}}' portfolio-v3-web-1

# Test health endpoint
curl http://localhost:3000/api/health

# Cek logs (pastikan log rotation aktif)
docker compose logs web
```

#### Step 9: Commit & Push

```bash
git add Dockerfile docker-compose.yml .github/workflows/docker-build.yml
git commit -m "fix(docker): busybox wget, resource limits, log rotation, CI push to GHCR"
git push origin master
```

### Verifikasi Setelah Eksekusi

```bash
# 1. Build image
docker compose -f docker-compose.yml build

# 2. Run container
docker compose -f docker-compose.yml up -d

# 3. Cek health status (harus "healthy" setelah ~30s)
docker inspect --format='{{.State.Health.Status}}' portfolio-v3-web-1

# 4. Test health endpoint
curl http://localhost:3000/api/health

# 5. Cek logs (pastikan log rotation aktif)
docker compose logs web | Select-Object -Last 10

# 6. Cek resource limits aktif
docker inspect --format='{{.HostConfig.Memory}}' portfolio-v3-web-1
```

---

## Bagian 5 — File Inventory (Final State)

| File | Status | Perlu Diedit? |
|---|---|---|
| `.nvmrc` | Selesai | Tidak |
| `next.config.ts` | Selesai | Tidak |
| `src/app/api/health/route.ts` | Selesai | Tidak |
| `playwright.config.ts` | Selesai | Tidak |
| `.dockerignore` | Selesai | Tidak |
| `.env` | Perlu diisi nilai asli | Ya (isi sebelum build) |
| `Dockerfile` | Bug #1 (wget) | Ya (Step 1-2) |
| `docker-compose.yml` | Bug #1, kurang limits/logs | Ya (Step 1, 3-4) |
| `docker-compose.override.yml` | Selesai | Tidak |
| `.github/workflows/docker-build.yml` | push: false, no scan | Ya (Step 6-7) |
| `README.md` | Selesai | Tidak |

---

## Bagian 6 — Cara Pakai Docker

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
| Image size | ~150MB (standalone output) |
| User | Non-root (`nextjs:nodejs`, uid 1001) |
| Health check | `/api/health` setiap 30s |
| Port | 3000 (host:container) |

### Kompatibilitas Vercel

- Dockerfile tidak mengganggu deploy Vercel — Vercel tetap bisa build dari `package.json` seperti biasa
- `output: 'standalone'` tidak berefek ke Vercel (Vercel punya build system sendiri)
- Keduanya bisa berjalan paralel: Vercel untuk production, Docker untuk self-hosting/testing
