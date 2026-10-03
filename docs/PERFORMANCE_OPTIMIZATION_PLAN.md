# Performance Optimization Plan — Gambar HD & Rendering

> Dibuat 2026-10-03 dari audit seluruh codebase (publik + admin). Centang checkbox saat dieksekusi.

## Context

Gambar di portfolio kadang lama sekali muncul, baik di sisi publik maupun admin. Hasil audit menemukan akar masalahnya:

1. **Semua gambar dikirim dalam ukuran asli.** Sejak commit `164e5d5`, `next.config.ts` memakai `images.unoptimized: true` (kuota optimizer Vercel habis, error 402). Akibatnya `srcset`, `sizes` dan `quality` tidak berfungsi. Thumbnail 40px di tabel admin pun mengunduh file asli berukuran MB.
2. **Upload tidak pernah di-resize atau dikompres.** File dari HP atau kamera langsung masuk bucket `portfolio-assets`.
3. **Cache hanya 1 jam.** `cacheControl` tidak diisi, sehingga berlaku default Supabase `3600`, padahal nama file selalu unik (timestamp).
4. **Bug `loading` eager.** Pola `priority={index<3}` + `loading={index>=3 ? "eager" : undefined}` membuat semua kartu dimuat eager. Contohnya, `certificates.html` berisi 56 `<link rel=preload as=image>`, jadi semua gambar berebut bandwidth dan gambar yang di atas layar justru lambat.
5. **Setiap kartu mengunduh gambar yang sama 2×** (background ambient blur + foreground).
6. **`BlurImage` menahan gambar di `opacity-0` sampai file selesai diunduh penuh.** Karena file besar, area gambar kosong lama.

Keputusan user:
- Supabase **Free**: tidak ada `/render/image`, jadi optimasi dilakukan saat upload.
- **Intro loader tidak diubah.**
- **Buat script migrasi** untuk gambar lama.

Hasil yang diharapkan:
- Gambar tetap HD: varian terbesar 2560px, WebP q≈90, dan browser memilih varian sesuai DPR (retina tetap tajam).
- Ukuran unduhan per gambar turun drastis.
- Perilaku gambar identik di admin dan publik.
- Tetap tanpa kuota Vercel Image Optimization.

## 1. Ringkasan audit per fitur

| Fitur | Publik | Admin | Masalah utama |
|---|---|---|---|
| Home (`/`) | 9 featured card (2 img/kartu, semua eager), skills-marquee (~116 motion.div, blur whileInView, re-shuffle setelah hydrate), journey-marquee (48 kartu untuk 4 foto, kolom tersembunyi di mobile tetap dirender) | – | file asli, eager, duplikat ambient |
| Projects (`/projects`, `/projects/[id]`) | semua kartu dirender + eager; RSC payload ikut membawa `content` markdown & `embed_code`; `getProjectById` tanpa `cache()` (2 query per render) | Grid: semua eager, 2 img/kartu; OrderModal memuat semua cover | file asli, payload besar |
| Certificates | ±56 kartu, 56 preload, URL Drive `=w1000` | Grid `w400`: URL berbeda dari publik, cache browser tidak terpakai bersama | eager, URL tidak konsisten |
| Experience / Education | `SafeLogo` / `SafeSchoolLogo` (duplikat, hardcode `edu-logo-1779640956114`) | `BlurImage` tanpa fallback onError | inkonsistensi fallback |
| Photos (Moment Recap) | journey-marquee `w600` (hanya efektif untuk Drive) | Grid semua eager; `getPhotos` tanpa `cache()` | file asli |
| Skills | `next/image unoptimized` 24px tanpa skeleton; `skills-grid.tsx` dead code | `BlurImage lowQuality` | inkonsistensi |
| Profile (avatar/logo/favicon) | avatar `priority` di semua halaman, favicon = `logo_url` mentah | upload via form action tanpa validasi tipe/ukuran | file asli, cache 1 jam |
| Dashboard admin | – | `getCounts()` men-`select('*')` 4 tabel penuh hanya untuk `.length`; chart fetch berurutan | query berat |
| Global | `template.tsx` fade di setiap navigasi; `AdminSidebar` chunk ikut dimuat di halaman publik; class `animate-in fade-in` no-op | `window.location.reload()` setelah create; `usePagination`/`PaginationControls` disalin 6–7×; dropdown page-size (12/24/48) tidak cocok untuk default 10 | – |
| Initial loading | Intro loader ±1.9s + 0.7s exit, sekali per tab | – | **Tidak diubah** (keputusan user). Gambar tetap diunduh di belakang overlay, jadi setelah optimasi gambar sudah siap saat overlay hilang. |

## 2. Strategi inti: "Pre-generated responsive variants + custom loader"

Tidak memakai optimizer Vercel maupun Supabase Pro. Caranya:

- **Saat upload (admin, di browser):** gambar di-resize menjadi beberapa varian WebP lalu diupload ke `portfolio-assets/opt/<key>/w{N}.webp` dengan `cacheControl: '31536000'` (immutable).
  - Lebar varian: `[128, 256, 640, 960, 1280, 1920, 2560]` (960 & 1280 ditambahkan di Fase 1 setelah pengukuran: ponsel DPR 2.6–3 melompat dari 1080 ke 1920).
  - Tidak ada upscale. Jika sumber lebih kecil, varian terbesar = lebar asli.
- **Yang disimpan di DB:** URL varian **terbesar** (`.../opt/<key>/w{max}.webp`). Kolom DB tidak berubah dan tidak perlu migrasi schema.
- **Custom loader `next/image`** (`images.loader: 'custom'`) memetakan setiap lebar `srcset` ke varian terdekat ≥ lebar diminta (dibatasi `max`). Browser memilih varian otomatis sesuai `sizes` + DPR. Gambar retina tetap tajam (HD terjaga), thumbnail kecil hanya mengunduh `w128`/`w256`.
- **URL non-varian:**
  - Google Drive / `lh3.googleusercontent.com`: loader mengganti `=w{width}`.
  - Unsplash (mock): loader mengatur `?w=`.
  - Lainnya (data:, blob:, SVG, GIF, domain lain): `unoptimized` per gambar, tampil apa adanya.

## 3. Task list

### Fase 0 — Quick wins (aman, tanpa infrastruktur baru) ✅ selesai 2026-10-04

Hasil: lihat `docs/perf/compare-baseline-local-vs-fase-0-local.md`.
- [x] **Perbaiki bug eager** di `featured-project-card.tsx`, `projects-filter-list.tsx`, `certificates-filter-list.tsx`, `admin/projects/ProjectGridView.tsx`, `admin/certificates/CertificateGridView.tsx`, `admin/photos/PhotoGridView.tsx`.
  - Index < 3 (atau 4): `loading="eager"` + `fetchPriority="high"`.
  - Sisanya: `loading="lazy"` (hapus pola `index >= N ? "eager"`).
- [x] **Ganti `priority`** (deprecated di Next 16, lihat `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` §preload).
  - `preload` hanya untuk LCP tunggal: cover `projects/[id]/page.tsx`.
  - Avatar sidebar: `fetchPriority="high"`.
  - Admin `PhotoPreviewModal`: `loading="eager"`.
- [x] **Ambient background:** tambahkan `loading="lazy"` + `fetchPriority="low"` pada BlurImage ambient (featured card, projects list, certificates list, project detail, admin grids).
- [x] **Isi `cacheControl: '31536000'`** di setiap `.upload()`: `src/app/admin/actions/uploads.ts`, `src/app/admin/actions/profile.ts` (avatar, logo, resume).
- [x] **`BlurImage`** (`src/components/ui/blur-image.tsx`):
  - Ganti `transition-all` dengan `transition-[opacity,filter,transform]`, dan pisahkan className transisi internal agar tidak tertimpa `transition-transform` dari consumer (bug tailwind-merge).
  - Durasi default 500ms → 300ms.
  - ⚠️ Regresi yang ditemukan saat review: transisi inline hanya mencakup `transform`, padahal Tailwind v4 `scale-*` menulis properti CSS `scale` → hover zoom kartu melompat tanpa animasi. Diperbaiki di "Revisi — Hover zoom kartu" di bawah.

### Fase 1 — Pipeline varian (inti optimasi) ✅ selesai 2026-10-04

Hasil: `docs/perf/compare-baseline-local-vs-fase-1-local.md`. Catatan implementasi:
- Hook `useImageUpload` diganti fungsi `uploadImage(file, prefix)` di `src/lib/upload-image.ts` (return shape sama dengan `uploadAssetAction`, jadi perubahan form minimal).
- Varian dikirim per batch ≤ 3.5 MB (batas body Vercel 4.5 MB); server memvalidasi key, nama, MIME & magic bytes.
- Gambar Google Drive disajikan lewat lh3 `=w<lebar>-rj-l90` (JPEG q90): sertifikat PNG ±1.6 MB → ±330 KB pada resolusi sama. `-rw` (WebP) Google selalu lossless.
- `quality` tidak lagi diteruskan BlurImage (loader custom tidak memakainya).
- `uploadAssetAction` & resume dibatasi 4 MB (batas body Vercel), prefix upload di-whitelist.
- [x] **Baru: `src/lib/image-variants.ts`** (isomorphic, tanpa `'use client'`):
  - `VARIANT_WIDTHS`, `VARIANT_QUALITY = 0.9`, `MAX_WIDTH = 2560`.
  - `parseVariantUrl(url)` → `{ base, max } | null` (regex `/portfolio-assets/opt/<key>/w(\d+)\.webp$`).
  - `variantUrl(url, width)`: pilih varian terkecil ≥ width dari `VARIANT_WIDTHS ∪ {max}` yang ≤ max.
  - `isLoaderSupported(src)`: varian Supabase | Drive/lh3 | Unsplash.
  - Preset `IMAGE_SIZES = { card, hero, logo, thumb, avatar, ambient }` agar string `sizes` sama di admin & publik.
- [x] **Baru: `src/lib/image-loader.ts`** (`'use client'`, default export `({src, width}) => string`):
  - Varian Supabase → `variantUrl`.
  - Drive `drive.google.com` → lewat `getDirectImageUrl` lalu `=w{width}`.
  - `lh3.googleusercontent.com/...=wN` → ganti N.
  - Unsplash → set `w`.
  - Lainnya → `src`.
- [x] **`next.config.ts` `images`:**
  - Hapus `unoptimized`, `formats`, `qualities`, `minimumCacheTTL`.
  - Set `loader: 'custom'`, `loaderFile: './src/lib/image-loader.ts'`, `deviceSizes: [640, 1080, 1920, 2560]`, `imageSizes: [64, 128, 256, 384]`.
  - Biarkan `remotePatterns`.
  - Komentar: "custom loader → tidak memakai /_next/image (kuota Vercel aman)".
- [x] **`BlurImage`:**
  - Ganti `isOptimizable` dengan `isLoaderSupported`, dan `unoptimized={!isLoaderSupported(src)}`.
  - `lowQuality` → `sizes` default `IMAGE_SIZES.ambient` (`64px`). Ambient jadi hanya mengunduh `w128`.
- [x] **`skills-marquee.tsx` & `skills-grid.tsx`:** hapus `unoptimized` hardcode, pakai `isLoaderSupported`. `skills-grid.tsx` hapus kalau benar-benar dead code.
- [x] **Baru: `src/lib/image-processing.ts`** (client-only):
  - `processImageFile(file): Promise<{ key, variants: {width, blob}[] } | { passthrough: File }>`.
  - Decode: `createImageBitmap(file, { imageOrientation: 'from-image' })` (EXIF benar).
  - Resize bertahap: halving hingga ≤2× target, lalu `drawImage` final dengan `imageSmoothingQuality = 'high'`. Hasilnya tajam, tanpa aliasing.
  - Encode `canvas.toBlob('image/webp', 0.9)`. Jika blob yang dihasilkan bukan webp (Safari), fallback `image/jpeg` 0.92 dengan ekstensi `.jpg`. Regex di `image-variants` harus menerima `webp|jpg`.
  - SVG / GIF / ICO → passthrough (tidak diproses).
  - Validasi di client: input ≤ 25MB, beri pesan error yang jelas.
- [x] **`src/app/admin/actions/uploads.ts`: action baru `uploadImageVariantsAction(formData)`.**
  - `requireAdmin()`, prefix whitelist (`project-cover`, `photo-gallery`, `exp-logo`, `edu-logo`, `skill-icon`, `avatar`, `logo`, `certificate`).
  - Validasi: lebar ∈ `VARIANT_WIDTHS` atau = max ≤ 2560; MIME webp/jpeg; tiap file ≤ 3MB; **total ≤ 4MB** (limit body Vercel Function 4.5MB).
  - Upload paralel ke `opt/${prefix}-${Date.now()}/w{N}.webp` dengan `{ contentType, cacheControl: '31536000', upsert: false }`.
  - Return URL varian max.
  - Mock mode: return data URL varian terbesar. Tes Playwright tetap jalan.
  - `uploadAssetAction` lama tetap untuk passthrough (SVG/GIF) + `cacheControl`.
- [x] **Baru: `src/components/admin/useImageUpload.ts`** (hook): `{ upload(file, prefix), isUploading, error, warning }`, termasuk peringatan "< 1200px" yang sekarang ada di `ProjectForm`. Lalu ganti 5 handler duplikat di:
  - `ProjectForm.tsx` (`:46-86`)
  - `PhotoForm.tsx`
  - `EducationForm.tsx`
  - `ExperienceForm.tsx`
  - `SkillForm.tsx` (sekaligus tampilkan error di UI, saat ini hanya `console.error`)
- [x] **`profile-form.tsx` + `actions/profile.ts`:**
  - Avatar & logo diproses lewat hook yang sama dan hasilnya mengisi hidden input `avatar_url` / `logo_url`. File mentah tidak lagi dikirim ke action.
  - Resume PDF tetap seperti sekarang + `cacheControl` + validasi `application/pdf` ≤ 5MB.
- [ ] **(Opsional) `CertificateForm.tsx`:** tambahkan tombol upload (prefix `certificate`) di samping input URL Drive.
- [x] **Konsistensi admin ↔ publik:**
  - Hapus argumen lebar manual (`getDirectImageUrl(url, 400/150/200/1000)`) di semua call site. Lebar sekarang diatur loader berdasarkan `sizes`. Tetap panggil `getDirectImageUrl(url)` untuk konversi link Drive. Pakai juga untuk cover project publik yang saat ini mentah.
  - Pakai preset `IMAGE_SIZES` di semua GridView / TableView / PreviewModal / Form / komponen publik.
  - Gabungkan `safe-school-logo.tsx` ke `safe-logo.tsx` (prop `detectDark`). ✅
  - ⏭️ Belum: `SafeLogo` di admin — container logo admin punya ukuran/warna sendiri, dibiarkan agar desain admin tidak berubah (URL & varian sudah seragam lewat BlurImage).
  - `referrerPolicy="no-referrer"` diterapkan seragam untuk URL Drive (di dalam BlurImage bila host Google).
- [x] **`src/app/layout.tsx` (metadata icons):** `variantUrl(profile.logo_url, 128)` untuk favicon dan `256` untuk apple-icon.

### Revisi — Hover zoom kartu lebih halus ✅ selesai 2026-10-04

Permintaan: zoom-in gambar kartu saat hover harus lebih smooth (publik: featured project, `/projects`, `/certificates`, Moment Recap).

- [x] **Perbaiki regresi Fase 0** di `src/components/ui/blur-image.tsx`: `transitionProperty` sekarang `opacity, filter, scale, transform`. Tailwind v4 `group-hover:scale-*` menulis properti `scale`, bukan `transform`, sehingga sebelumnya zoom langsung melompat (terukur: scale 1.030 sejak 0 ms).
- [x] **Kurva zoom baru**: 800 ms + `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (easeOutQuad) untuk `scale`/`transform`; fade-in tetap 300 ms. Konstanta `ZOOM_DURATION_MS` / `ZOOM_EASING` di `blur-image.tsx`.
- [x] **Layer GPU hanya saat hover**: class `group-hover:will-change-[scale]` di BlurImage — animasi berjalan di compositor tanpa menahan memori GPU untuk puluhan kartu sekaligus.
- [x] Hapus class `transition-transform duration-500` yang tidak lagi berlaku dari consumer (`featured-project-card.tsx`, `projects-filter-list.tsx`, `certificates-filter-list.tsx`, `journey-marquee.tsx`) — transisi kini diatur terpusat oleh BlurImage.
- [x] Test regresi di `tests/images.spec.ts`: "card hover zoom animates the CSS scale property smoothly".

Hasil sampling `scale` gambar depan saat hover (desktop, interval ±85 ms):

| Versi | 0 ms | ~85 ms | ~175 ms | ~260 ms | ~350 ms | ~450 ms | ~700 ms |
|---|---|---|---|---|---|---|---|
| Production lama (500 ms, default Tailwind) | 1.000 | 1.015 | 1.022 | 1.026 | 1.029 | 1.030 | 1.030 |
| Fase 0/1 sebelum fix | 1.030 | 1.030 | 1.030 | 1.030 | 1.030 | 1.030 | 1.030 |
| **Baru (800 ms easeOutQuad)** | 1.000 | 1.005 | 1.012 | 1.016 | 1.021 | 1.024 | 1.029 |

Versi lama menyelesaikan separuh zoom dalam ±85 ms pertama (terasa menyentak). Versi baru naik bertahap dan mendarat halus di ±780 ms. Untuk menyetel ulang rasa zoom, cukup ubah `ZOOM_DURATION_MS` / `ZOOM_EASING`.

### Fase 2 — Migrasi gambar lama ✅ selesai 2026-10-04

Hasil: `docs/perf/compare-baseline-local-vs-fase-2-local.md`. Laporan rollback: `scripts/migration-reports/migration-2026-10-03T20-40-36-685Z.json`.

- [x] `sharp` ditambahkan sebagai devDependency eksplisit (`^0.34.5`). Lockfile ikut tersinkron (sebelumnya `npm ci` gagal karena `@emnapi/*` tidak sinkron).
- [x] **Baru: `scripts/optimize-existing-images.mjs`** — mengimpor aturan varian langsung dari `src/lib/image-variants.ts` (Node 24 type-stripping), jadi hasilnya identik dengan upload admin.
  - **Tanpa service role key**: script login sebagai admin (anon key + `MIGRATE_ADMIN_EMAIL` / `MIGRATE_ADMIN_PASSWORD` sebagai env sesaat), sehingga tetap tunduk pada RLS. `SUPABASE_SERVICE_ROLE_KEY` tidak dibutuhkan.
  - Target: `profiles.avatar_url`, `profiles.logo_url`, `projects.cover_image`, URL gambar di `projects.content` (markdown), `experiences.logo_url`, `education.logo_url`, `certificates.image_url`, `skills.logo_url`, `photos.image_url`. Hanya URL bucket `portfolio-assets` yang belum di `opt/`; SVG/GIF/ICO, Drive & URL eksternal dilewati. Nama folder varian = nama file asli (cek `edu-logo-1779640956114` di SafeLogo tetap valid).
  - Encoding per varian: foto → WebP lossy q90 + `smartSubsample`; grafis (PNG / transparan) → dicoba lossy q90, near-lossless, lossless, diambil **yang terkecil** (lossless = identik). Tanpa langkah ini beberapa PNG sederhana justru membesar (mis. 246 KB → 441 KB).
  - Default **dry-run**; `--out <dir>` menyimpan varian lokal untuk dicek visual; `--apply` upload (cache 1 tahun) → verifikasi tiap varian terbesar bisa diakses → baru update DB (filter `id` + nilai lama). Laporan JSON selalu ditulis (`finally`); `--rollback <laporan>` mengembalikan URL lama. File asli **tidak dihapus**.
- [x] Dry-run: 64 file unik / 64 referensi DB. Total file asli **33.98 MB → varian terbesar 8.09 MB (−76%)**; browser biasanya mengambil varian yang lebih kecil lagi.
- [x] Cek kualitas sebelum apply (crop 100% asli vs varian): cover project penuh teks PSNR **38.7 dB**, foto 8.26 MB PSNR **41.9 dB** — visually lossless, teks tetap tajam.
- [x] `--apply`: **64 baris DB diperbarui**, 0 gagal. Dry-run ulang: 0 kandidat tersisa. Header varian: `cache-control: public, max-age=31536000`, CDN `HIT` pada request kedua.
- [x] Verifikasi 11 halaman publik + admin (desktop DPR 2, scroll penuh): 0 gambar rusak, 0 HTTP error.
- [ ] **Production**: halaman ISR & Data Cache (`revalidate = 3600`) memakai URL baru paling lambat 1 jam, atau segera via `/admin` → "Revalidate public pages". Sebelum kode Fase 0–1 di-deploy, production lama langsung menampilkan varian `w<max>.webp` (sudah jauh lebih kecil dari file asli).

Temuan: build lokal sempat masih memakai URL lama karena `.next/cache/fetch-cache` (Data Cache dari `revalidate = 3600`). Hapus folder itu bila mengukur build lokal tepat setelah data berubah.

Hasil vs baseline (build lokal, cold load, scroll penuh):

| Halaman | Total gambar (desktop) | Total gambar (mobile 4G) | Gambar atas-layar selesai (mobile) | LCP mobile |
|---|---|---|---|---|
| `/` | 21.77 MB → **954 KB** | 21.78 MB → **1.76 MB** | 5.85 s → **1.57 s** | 1.04 → 1.03 s |
| `/projects` | 9.43 MB → **1.02 MB** | 9.45 MB → **1.68 MB** | 9.05 s → **1.43 s** | 6.54 → **1.86 s** |
| `/certificates` | 19.98 MB → **3.51 MB** | 20.00 MB → **6.59 MB** | 17.40 s → **1.28 s** | 17.58 → **1.49 s** |
| `/experience` | 1.87 MB → **48 KB** | 1.89 MB → **168 KB** | 2.46 s → **1.60 s** | – |
| `/education` | 3.79 MB → **49 KB** | 3.81 MB → **187 KB** | 4.00 s → **1.56 s** | – |
| `/projects/[id]` | 1.65 MB → **141 KB** | 1.67 MB → **220 KB** | 2.27 s → **0.71 s** | – |
| `/admin/projects` | 8.11 MB → **938 KB** | 8.11 MB → **1.48 MB** | 5.03 s → **1.53 s** | 5.69 → **2.04 s** |
| `/admin/education` | 2.95 MB → **45 KB** | 2.95 MB → **45 KB** | 3.61 s → **1.63 s** | – |

### Fase 3 — Perbaikan non-gambar per fitur ✅ selesai 2026-10-04

Hasil: `docs/perf/compare-fase-2-local-vs-fase-3-local.md` (tidak ada regresi; ukuran gambar identik) dan pengukuran payload di bawah.

- [x] **`data-service.ts`**
  - `getCounts()` → `select('id', { count: 'exact', head: true })` per tabel (hanya jumlah baris). Fallback ke cara lama bila query count gagal / mock mode. Dicek: dashboard tetap menampilkan 24 / 15 / 4 / 55 (sama dengan jumlah baris asli).
  - `getPhotos` & `getProjectById` dibungkus `cache()` (dedupe per request: home + rag-context, generateMetadata + page detail).
  - **`getProjectSummaries()`** baru untuk home & `/projects`: `content` (markdown) dan `embed_code` dikosongkan sebelum dikirim ke komponen client. Query tetap `select('*')` lewat `getProjects()` — sengaja tidak memakai daftar kolom eksplisit karena `featured_order` ada di DB tapi tidak di `schema.sql` (salah satu kolom keliru → query gagal → diam-diam jatuh ke data mock). Pencarian kartu hanya memakai `title`/`description`.
- [x] **AdminSidebar tidak lagi dimuat di halaman publik** — `src/components/admin-sidebar-slot.tsx` (client) mengecek `usePathname()` lalu `next/dynamic` memuat sidebar admin hanya di `/admin`. Posisi di DOM tidak berubah (memindahkan ke `admin/layout.tsx` akan menaruhnya di dalam `<main overflow-x-hidden>` dan berisiko merusak layout/sticky). Sidebar admin kini chunk sendiri **3.7 KB gz**, tidak ikut di `/projects`.
- [x] **`window.location.reload()` → `router.refresh()`** setelah membuat item baru di 6 fitur admin (projects, certificates, education, experience, photos, skills). Daftar tersinkron lewat pola `prevInitial…` yang sudah ada; notifikasi sukses tetap tampil. Test: `tests/admin-crud-refresh.spec.ts`.
- [x] **Pagination digabung** ke `src/components/admin/shared/` (`usePagination.ts`, `PaginationControls.tsx`); 7 salinan `usePagination` (termasuk yang tak terpakai di `messages/`) + 6 salinan `PaginationControls` dihapus. Prop baru `pageSizeOptions`: education / experience / skills (default 10) memakai `[10, 20, 50]`, sisanya `[12, 24, 48]` — dropdown kini selalu cocok dengan nilai default.
- [x] **Cleanup file storage lama** — `src/app/admin/actions/_storage.ts`:
  - `readFileUrl()` membaca nilai lama sebelum update/delete; `scheduleFileCleanup()` menjalankan `removeFileIfUnused()` lewat `after()` **hanya setelah DB sukses** (tidak menambah waktu simpan).
  - Dipasang di save (edit) & delete: projects, certificates, education, experience, photos, skills; plus avatar / logo / resume di profile.
  - Pengaman: hanya file bucket `portfolio-assets` (Drive/eksternal diabaikan); tidak menghapus bila URL masih dirujuk baris lain atau markdown `projects.content` (pengecekan gagal → dianggap masih dipakai); URL varian → seluruh folder `opt/<key>/` dihapus; error cleanup hanya dicatat.
  - File asli pra-migrasi (backup rollback Fase 2) tidak tersentuh karena tidak lagi dirujuk lewat save/delete.
  - Test dengan client Supabase palsu: `tests/storage-cleanup.spec.ts`.
  - Upload yang dibatalkan (tanpa Save) ditangani di bagian "Revisi — Upload yang tidak jadi disimpan" di bawah.
- [x] Bonus dari audit: `deleteProjectAction` kini juga `revalidatePath('/projects/<id>')`.
- [x] Class no-op `animate-in fade-in duration-200` dihapus dari 16 `loading.tsx` + sidebar (tidak ada keyframe-nya, jadi tampilan tidak berubah).
- [~] **`journey-marquee.tsx` kolom 2–3 di mobile — dievaluasi, tidak diubah.** Diukur: di mobile hanya 4 request foto unik (semua salinan memakai URL yang sama; `<img>` lazy di elemen `display:none` tidak diunduh). Sisa biaya hanya ±32 node DOM tersembunyi, sedangkan render kondisional berbasis viewport berisiko hydration mismatch / flash di desktop.
- [~] **`skills-marquee.tsx` shuffle — dievaluasi, tidak diubah.** Urutan acak per kunjungan adalah fitur. Seed deterministik menghilangkannya; key berbasis id tidak membantu karena shuffle memindahkan skill antar baris (React tetap remount). Marquee di bawah fold, biaya re-render sekali setelah hydrate hanya milidetik.
- [~] **Limit `messages` & `ai_chat_logs` — belum diperlukan.** Saat ini `messages` = 2 baris; statistik di admin (`logs.length`) akan salah bila sekadar diberi `.limit()`. Tinjau ulang bila > ±500 baris: tambahkan pagination server + query count terpisah.

Payload halaman (build lokal, sebelum → sesudah Fase 3):

| Halaman | HTML | RSC payload | JS (gzip, semua chunk) |
|---|---|---|---|
| `/` | 439 KB → **426 KB** | 107 KB → **95 KB** (−12%) | 275 → 273 KB |
| `/projects` | 234 KB → **215 KB** | 86 KB → **68 KB** (−21%) | 277 → 275 KB |
| `/certificates` | 504 KB → 504 KB | 62 KB → 62 KB | 277 → 275 KB |

### Revisi — Upload yang tidak jadi disimpan (orphan) ✅ selesai 2026-10-04

Masalah: gambar langsung diupload saat dipilih di form, jadi bila form dibatalkan / gambar diganti sebelum Save / tab ditutup, file-nya tertinggal di storage.

- [x] **Lapis 1 — pembersihan langsung saat form ditutup.** Hook `src/components/admin/useUploadSession.ts` mencatat setiap URL yang berhasil diupload selama form terbuka (ProjectForm, PhotoForm, EducationForm, ExperienceForm, SkillForm, profile-form). Saat form di-unmount (Cancel, Save, atau pindah halaman) daftar itu dikirim ke `discardUploadsAction` (`src/app/admin/actions/storage.ts`).
  - Tidak perlu tahu "tadi disimpan atau tidak": server memakai `removeFileIfUnused`, jadi URL yang sudah tersimpan di DB otomatis dilewati; hanya upload yang dibatalkan / tergantikan yang terhapus. Save sukses meng-unmount form setelah DB selesai ditulis.
  - Hanya menerima URL upload baru (`isFreshUploadUrl` di `_storage.ts`): `opt/<prefix>-<13 digit>/w<lebar>.(webp|jpg)` atau SVG/GIF/ICO di root. Backup file asli migrasi & folder hasil migrasi tidak pernah cocok. Maks. 20 URL per panggilan, admin-only, no-op di mock mode.
- [x] **Lapis 2 — penyapu manual di dashboard** untuk sisa kasus (tab ditutup paksa, koneksi putus). Tombol **"Clean Storage"** di header `/admin` → `scanOrphanUploadsAction` → konfirmasi jumlah & ukuran → `deleteOrphanUploadsAction`.
  - Hanya folder `opt/<key>/` yang tidak dirujuk baris mana pun (termasuk markdown `projects.content`) **dan** semua file-nya berumur > 24 jam (form yang sedang terbuka aman). File di root bucket — termasuk backup migrasi — tidak pernah disentuh.
  - Daftar hapus dihitung ulang di server (tidak menerima path dari client). Bila ada satu query referensi yang gagal, proses dibatalkan (tidak menghapus apa pun).
  - Memakai sesi admin (RLS), tidak butuh service role key / cron.
- [x] Test: `tests/storage-cleanup.spec.ts` — `isFreshUploadUrl`, pemindai folder yatim (dirujuk / terlalu baru / yatim), dan abort saat query gagal.
- [x] **Diuji di Supabase sungguhan** (build lokal, tanpa menulis DB): upload gambar uji 3200×1800 di form Photos → 7 varian terbentuk (`w128`…`w2560`) → "Back to Listing" tanpa Save → folder terhapus. Tombol "Clean Storage" memindai 64 folder dalam ±4 s: "No unsaved uploads to clean."

Catatan: penyapu tidak otomatis terjadwal. Bila ingin otomatis, butuh Vercel Cron + `SUPABASE_SERVICE_ROLE_KEY` di env server (cron tidak punya sesi admin).

## Hasil di production ✅ 2026-10-04

Deploy: commit `24276b4`…`40c638a` di-push ke `master` → Vercel production aktif ±60 s kemudian. Diukur dengan `scripts/measure-images.mjs` (cold load, cache browser mati) terhadap https://alfitranurr.vercel.app — metode sama dengan baseline awal.

- `docs/perf/production-after.md` — run 1, tepat setelah deploy (CDN masih dingin: varian & ukuran Google Drive baru pertama kali diminta).
- `docs/perf/production-after-run2.md` — run 2, CDN hangat (mewakili pengunjung biasa). Perbandingan: `docs/perf/compare-baseline-production-vs-production-after-run2.md`.

| Halaman | Total gambar (mobile 4G) | Gambar atas-layar selesai (mobile) | LCP mobile | LCP desktop |
|---|---|---|---|---|
| `/` | 21.78 MB → **1.76 MB** | 5.60 s → **1.52 s** | 1.61 → **0.90 s** | 1.78 → **0.72 s** |
| `/projects` | 9.45 MB → **1.68 MB** | 9.13 s → **1.40 s** | 7.98 → **1.86 s** | 1.75 → **1.55 s** |
| `/certificates` | 20.00 MB → **6.59 MB** | 17.41 s → **1.25 s** | 17.50 → **1.65 s** | 1.95 → **1.33 s** |
| `/experience` | 1.89 MB → **168 KB** | 2.43 s → **0.90 s** | 1.16 → **0.74 s** | 0.92 → **0.47 s** |
| `/education` | 3.81 MB → **187 KB** | 3.93 s → **0.91 s** | 0.76 → 1.30 s* | 1.05 → **0.53 s** |
| `/projects/[id]` | 1.67 MB → **220 KB** | 2.27 s → **0.76 s** | 0.94 → **0.86 s** | 2.21 → **1.23 s** |
| `/admin/projects` | 8.11 MB → **1.48 MB** | 4.61 s → **1.79 s** | 5.27 → **2.23 s** | 4.17 → **2.59 s** |
| `/admin/education` | 2.95 MB → **45 KB** | 4.79 s → **1.67 s** | 1.88 → **1.56 s** | 2.96 → **2.04 s** |

\* LCP berupa teks (heading); variasi ±0.5 s antar run adalah noise jaringan/hydration — run 1 halaman yang sama: 0.74 s.

Catatan:
- Tidak ada request ke `/_next/image` (kuota Vercel Image Optimization tidak terpakai); varian disajikan dari CDN Supabase dengan `cache-control: public, max-age=31536000`.
- Preload gambar per halaman turun dari 56 → 4 (certificates), 15 → 4 (projects), 12 → 3 (admin projects).
- Sisa waktu di halaman admin (±1.5–2.5 s) kini didominasi server, bukan gambar: semua route admin `force-dynamic` + `auth.getUser()` dipanggil di proxy dan lagi di tiap action/page. Kandidat optimasi berikutnya bila diperlukan.

## 4. Yang sengaja TIDAK diubah
- `src/components/initial-loader.tsx` (durasi intro tetap).
- Animasi `template.tsx` dan efek blur-fade kartu (desain dipertahankan; hanya transisi BlurImage yang diperbaiki).
- Schema DB (URL tetap di kolom yang sama).

## 5. Verifikasi
1. **Baseline sebelum mulai** ✅ (`docs/perf/baseline*.md`, alat ukur: `node scripts/measure-images.mjs --label <nama> [--base URL] [--only public|admin]`, banding: `node scripts/compare-perf.mjs <a> <b>`): Chrome DevTools → Network (Img, Disable cache, Fast 4G) di `/`, `/projects`, `/certificates`, `/admin/projects`. Catat total transfer gambar, jumlah request, dan LCP (Lighthouse mobile). Ulangi setelah tiap fase.
2. `npm run lint` dan `npm run build`. Build harus sukses dengan loader custom; cek tidak ada request ke `/_next/image` di Network.
3. `npm run test` (mock mode). Tambah `tests/images.spec.ts`:
   - Kartu project index ≥ 3 punya `loading="lazy"`.
   - `<img>` mock Unsplash punya `srcset` dengan beberapa `w=`.
   - Halaman `/certificates` tidak lagi berisi puluhan `link[rel=preload][as=image]`.
4. **Manual admin (Supabase asli):**
   - Upload foto HP besar (> 5MB) di Project form. Di bucket harus muncul `opt/project-cover-<ts>/w128…w2560.webp`.
   - `curl -I <url>` → `cache-control: max-age=31536000`.
   - Tampilan cover di detail project tetap tajam di layar retina (DevTools: `currentSrc` memilih w1920/w2560 saat DPR 2).
5. **Migrasi** ✅: dry-run → cek laporan & kualitas → `--apply` → cek halaman publik & admin → report JSON tersimpan di `scripts/migration-reports/`.
6. Cek konsistensi: gambar yang sama di admin & publik memakai URL varian dari key yang sama (cache browser terpakai bersama).

## 6. Catatan risiko
- Dev-only warning "loader does not implement width" bisa muncul untuk gambar kecil yang varian max-nya = `src`. Ini aman (`warnOnce`, hanya di dev).
- Safari belum bisa encode WebP via canvas, jadi fallback JPEG q0.92 (tetap HD). Admin umumnya memakai Chrome / Edge.
- Varian disimpan duplikat di storage (±6 file kecil per gambar). Dengan total ukuran jauh di bawah file asli, kuota Free 1GB tetap aman.
