// Aturan varian gambar responsif yang dibuat saat upload (admin) dan oleh script migrasi.
// Dipakai bersama oleh custom loader next/image, server action upload, dan script migrasi,
// jadi jangan mengimpor apa pun yang server-only atau client-only di sini.
//
// Struktur storage:  portfolio-assets/opt/<key>/w<lebar>.<webp|jpg>
// Yang disimpan di DB: URL varian TERBESAR, mis. .../opt/project-cover-1783969421916/w2560.webp
// Semua varian VARIANT_WIDTHS yang < lebar terbesar dijamin ada.

/** Lebar varian yang dibuat (px). Varian terbesar = min(lebar asli, MAX_IMAGE_WIDTH). */
// Jarak antar varian dijaga ≤ ~1.5× agar ponsel DPR 2.6–3 tidak melompat ke varian yang jauh lebih besar
export const VARIANT_WIDTHS = [128, 256, 640, 960, 1280, 1920, 2560] as const
export const MAX_IMAGE_WIDTH = 2560
/** Kualitas encode WebP (0–1). 0.9 = visual praktis identik dengan asli. */
export const VARIANT_QUALITY = 0.9

export const VARIANT_DIR = 'opt'
export const STORAGE_BUCKET = 'portfolio-assets'

/** Preset `sizes` agar admin & publik meminta varian yang sama untuk elemen yang sama. */
export const IMAGE_SIZES = {
  /**
   * Kartu grid 1/2/3 kolom (projects, certificates, featured, journey). Mengikuti
   * grid-cols-1 / md:grid-cols-2 / lg:grid-cols-3 + padding kartu & sidebar desktop.
   * Sedikit di atas lebar render agar tetap tajam (HD) saat sidebar di-collapse.
   */
  card: '(max-width: 767px) 80vw, (max-width: 1023px) 45vw, (max-width: 1440px) 30vw, 440px',
  /** Cover detail project */
  hero: '(max-width: 768px) 100vw, 1200px',
  /** Foto di preview modal */
  modal: '(max-width: 768px) 100vw, 768px',
  /** Avatar sidebar (112px) */
  avatar: '112px',
  /** Logo instansi/perusahaan (48–64px) */
  logo: '64px',
  /** Thumbnail tabel admin / preview form */
  thumb: '96px',
  /** Background ambient yang di-blur — cukup varian terkecil */
  ambient: '64px',
} as const

const VARIANT_RE = new RegExp(
  `^(.*/storage/v1/object/public/${STORAGE_BUCKET}/${VARIANT_DIR}/[^/]+/)w(\\d+)\\.(webp|jpg)$`
)
const GOOGLE_SIZED_RE = /^(https:\/\/lh3\.googleusercontent\.com\/.+?)=[\w-]+$/
/**
 * Opsi lh3 untuk gambar Google Drive: JPEG kualitas 90 (`-rj-l90`).
 * Tanpa opsi ini Google mengirim format asli (sertifikat PNG ±1.6 MB @960px → ±330 KB).
 * `-rw` (WebP) dari Google selalu lossless sehingga tidak lebih kecil. Gambar Drive di
 * portfolio ini adalah sertifikat (tanpa transparansi), jadi JPEG aman.
 */
const GOOGLE_IMAGE_OPTIONS = '-rj-l90'
const DRIVE_RE = /https?:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/

export interface ParsedVariant {
  /** URL folder varian, diakhiri "/" */
  base: string
  /** Lebar varian terbesar yang tersedia */
  max: number
  ext: 'webp' | 'jpg'
}

export function parseVariantUrl(url: string): ParsedVariant | null {
  const m = url.match(VARIANT_RE)
  if (!m) return null
  return { base: m[1], max: Number(m[2]), ext: m[3] as 'webp' | 'jpg' }
}

/** Lebar varian yang tersedia untuk sebuah gambar dengan varian terbesar `max`. */
export function availableWidths(max: number): number[] {
  return [...VARIANT_WIDTHS.filter((w) => w < max), max]
}

/** Varian terkecil yang lebarnya >= `width` (dibatasi varian terbesar). */
export function pickVariantWidth(max: number, width: number): number {
  return availableWidths(max).find((w) => w >= width) ?? max
}

/**
 * URL gambar untuk lebar tampilan tertentu. URL yang tidak dikenali dikembalikan apa adanya.
 * Dipakai oleh custom loader dan kode server (mis. favicon di metadata).
 */
export function variantUrl(url: string, width: number): string {
  const v = parseVariantUrl(url)
  if (v) return `${v.base}w${pickVariantWidth(v.max, width)}.${v.ext}`

  const drive = url.match(DRIVE_RE)
  if (drive) return `https://lh3.googleusercontent.com/d/${drive[1]}=w${width}${GOOGLE_IMAGE_OPTIONS}`

  const g = url.match(GOOGLE_SIZED_RE)
  if (g) return `${g[1]}=w${width}${GOOGLE_IMAGE_OPTIONS}`
  if (url.startsWith('https://lh3.googleusercontent.com/')) return `${url}=w${width}${GOOGLE_IMAGE_OPTIONS}`

  if (url.startsWith('https://images.unsplash.com/')) {
    const u = new URL(url)
    u.searchParams.set('w', String(width))
    if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format')
    return u.toString()
  }
  return url
}

/** True jika custom loader bisa menyajikan beberapa lebar untuk URL ini. */
export function isLoaderSupported(src: unknown): src is string {
  if (typeof src !== 'string') return false
  return (
    VARIANT_RE.test(src) ||
    DRIVE_RE.test(src) ||
    src.startsWith('https://lh3.googleusercontent.com/') ||
    src.startsWith('https://images.unsplash.com/')
  )
}

/** Path storage untuk satu varian (relatif terhadap bucket). */
export function variantPath(key: string, width: number, ext: 'webp' | 'jpg'): string {
  return `${VARIANT_DIR}/${key}/w${width}.${ext}`
}

/** Prefix upload yang diizinkan (dipakai validasi server). */
export const UPLOAD_PREFIXES = [
  'project-cover',
  'photo-gallery',
  'exp-logo',
  'edu-logo',
  'skill-icon',
  'avatar',
  'logo',
  'certificate',
] as const
export type UploadPrefix = (typeof UPLOAD_PREFIXES)[number]

/** Key folder varian: `<prefix>-<timestamp>` (format sama dengan nama file lama). */
export const VARIANT_KEY_RE = new RegExp(`^(${UPLOAD_PREFIXES.join('|')})-\\d{13}$`)
