import type { SupabaseClient } from '@supabase/supabase-js'
import { after } from 'next/server'
import { STORAGE_BUCKET, UPLOAD_PREFIXES, VARIANT_DIR, parseVariantUrl } from '@/lib/image-variants'

/** Semua kolom yang menyimpan URL file di bucket `portfolio-assets`. */
const FILE_COLUMNS = [
  { table: 'profiles', column: 'avatar_url' },
  { table: 'profiles', column: 'logo_url' },
  { table: 'profiles', column: 'resume_url' },
  { table: 'projects', column: 'cover_image' },
  { table: 'experiences', column: 'logo_url' },
  { table: 'education', column: 'logo_url' },
  { table: 'certificates', column: 'image_url' },
  { table: 'skills', column: 'logo_url' },
  { table: 'photos', column: 'image_url' },
] as const

const PUBLIC_MARKER = `/storage/v1/object/public/${STORAGE_BUCKET}/`

const UPLOAD_KEY = `(?:${UPLOAD_PREFIXES.join('|')})-\\d{13}`
// Hanya upload baru dari admin: folder varian, atau file passthrough (SVG/GIF/ICO) di root.
// File lama / backup migrasi (mis. `project-cover-<ts>.png` di root) tidak pernah cocok.
const FRESH_UPLOAD_RE = new RegExp(
  `${PUBLIC_MARKER}(?:${VARIANT_DIR}/${UPLOAD_KEY}/w\\d+\\.(?:webp|jpg)|${UPLOAD_KEY}\\.(?:svg|gif|ico))$`
)

/** True untuk URL hasil upload admin yang boleh dibuang bila tidak jadi disimpan. */
export function isFreshUploadUrl(url: unknown): url is string {
  return typeof url === 'string' && FRESH_UPLOAD_RE.test(url)
}

/** Path objek relatif terhadap bucket, atau null jika URL bukan file bucket ini. */
function objectPathOf(url: string): string | null {
  const i = url.indexOf(PUBLIC_MARKER)
  if (i < 0) return null
  return decodeURIComponent(url.slice(i + PUBLIC_MARKER.length).split('?')[0])
}

/** Nilai kolom sebuah baris sebelum di-update / dihapus. */
export async function readFileUrl(
  supabase: SupabaseClient,
  table: string,
  column: string,
  id: string
): Promise<string | null> {
  const { data, error } = await supabase.from(table).select(column).eq('id', id).maybeSingle()
  if (error || !data) return null
  const value = (data as unknown as Record<string, unknown>)[column]
  return typeof value === 'string' ? value : null
}

/** True jika masih ada baris (atau markdown project) yang merujuk file/folder varian ini. */
async function isStillReferenced(supabase: SupabaseClient, url: string, variantBase: string | null): Promise<boolean> {
  const checks = FILE_COLUMNS.map(({ table, column }) => {
    const q = supabase.from(table).select('id', { count: 'exact', head: true })
    return variantBase ? q.like(column, `${variantBase}%`) : q.eq(column, url)
  })
  const needle = variantBase ?? url
  checks.push(supabase.from('projects').select('id', { count: 'exact', head: true }).like('content', `%${needle}%`))

  const results = await Promise.all(checks)
  // Kalau pengecekan gagal, anggap masih dipakai (lebih aman tidak menghapus)
  return results.some((r) => r.error || (r.count ?? 0) > 0)
}

/**
 * Hapus file lama dari storage setelah gambar diganti / record dihapus.
 * - Hanya file di bucket ini; URL Drive / eksternal diabaikan.
 * - URL varian (`opt/<key>/w<lebar>.webp`) → seluruh folder varian dihapus.
 * - Tidak menghapus jika URL masih dirujuk baris lain.
 * - Tidak pernah melempar error: kegagalan cleanup hanya dicatat.
 */
export async function removeFileIfUnused(
  supabase: SupabaseClient,
  oldUrl: string | null | undefined,
  newUrl?: string | null
): Promise<void> {
  try {
    if (!oldUrl || oldUrl === newUrl) return
    const objectPath = objectPathOf(oldUrl)
    if (!objectPath) return

    const variant = parseVariantUrl(oldUrl)
    const variantBase = variant?.base ?? null
    // Ganti ke varian lain dari folder yang sama (mis. hanya beda lebar) → jangan hapus
    if (variantBase && newUrl?.startsWith(variantBase)) return
    if (await isStillReferenced(supabase, oldUrl, variantBase)) return

    const storage = supabase.storage.from(STORAGE_BUCKET)
    let paths = [objectPath]
    if (variantBase) {
      const folder = objectPath.slice(0, objectPath.lastIndexOf('/'))
      if (!folder.startsWith(`${VARIANT_DIR}/`)) return
      const { data, error } = await storage.list(folder, { limit: 100 })
      if (error) throw error
      paths = (data ?? []).map((f) => `${folder}/${f.name}`)
    }
    if (paths.length === 0) return
    const { error } = await storage.remove(paths)
    if (error) throw error
  } catch (err) {
    console.warn('removeFileIfUnused: cleanup skipped:', err instanceof Error ? err.message : err)
  }
}

/** Jadwalkan cleanup setelah response terkirim (tidak menambah waktu simpan). */
export function scheduleFileCleanup(
  supabase: SupabaseClient,
  oldUrl: string | null | undefined,
  newUrl?: string | null
): void {
  if (!oldUrl || oldUrl === newUrl) return
  after(() => removeFileIfUnused(supabase, oldUrl, newUrl))
}

// ---------------------------------------------------------------------------
// Penyapu file yatim: varian yang terupload tapi tidak pernah tersimpan
// (form dibatalkan / tab ditutup sebelum Save).
// ---------------------------------------------------------------------------

const VARIANT_KEY_IN_TEXT_RE = new RegExp(`${PUBLIC_MARKER}${VARIANT_DIR}/([^/"'\s)]+)/`, 'g')

/** Semua key folder varian yang masih dirujuk DB. Melempar error bila ada query yang gagal. */
async function referencedVariantKeys(supabase: SupabaseClient): Promise<Set<string>> {
  const keys = new Set<string>()
  const collect = (value: unknown) => {
    if (typeof value !== 'string') return
    for (const m of value.matchAll(VARIANT_KEY_IN_TEXT_RE)) keys.add(m[1])
  }
  const queries = [
    ...FILE_COLUMNS.map(({ table, column }) => ({ table, column })),
    { table: 'projects', column: 'content' },
  ]
  for (const { table, column } of queries) {
    const { data, error } = await supabase.from(table).select(column)
    if (error) throw new Error(`Gagal membaca ${table}.${column}: ${error.message}`)
    for (const row of (data ?? []) as unknown as Record<string, unknown>[]) collect(row[column])
  }
  return keys
}

export interface OrphanFolder {
  key: string
  paths: string[]
  bytes: number
  newestAt: string | null
}

/**
 * Folder `opt/<key>/` yang tidak dirujuk baris mana pun dan semua file-nya lebih tua dari
 * `minAgeHours` (memberi waktu untuk form yang masih terbuka). File di root bucket
 * (termasuk backup file asli migrasi) tidak pernah disentuh.
 */
export async function findOrphanVariantFolders(
  supabase: SupabaseClient,
  { minAgeHours = 24 }: { minAgeHours?: number } = {}
): Promise<OrphanFolder[]> {
  const referenced = await referencedVariantKeys(supabase)
  const storage = supabase.storage.from(STORAGE_BUCKET)

  const folders: string[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await storage.list(VARIANT_DIR, { limit: 1000, offset })
    if (error) throw error
    // Entri tanpa id = "folder" (prefix)
    folders.push(...(data ?? []).filter((e) => !e.id).map((e) => e.name))
    if (!data || data.length < 1000) break
  }

  const cutoff = Date.now() - minAgeHours * 3600 * 1000
  const orphans: OrphanFolder[] = []
  for (const key of folders) {
    if (referenced.has(key)) continue
    const { data, error } = await storage.list(`${VARIANT_DIR}/${key}`, { limit: 100 })
    if (error) throw error
    const files = (data ?? []).filter((f) => f.id)
    if (files.length === 0) continue
    const times = files.map((f) => Date.parse(f.created_at ?? f.updated_at ?? '')).filter((t) => !Number.isNaN(t))
    const newest = times.length ? Math.max(...times) : NaN
    if (Number.isNaN(newest) || newest > cutoff) continue
    orphans.push({
      key,
      paths: files.map((f) => `${VARIANT_DIR}/${key}/${f.name}`),
      bytes: files.reduce((s, f) => s + (Number((f.metadata as { size?: number } | null)?.size) || 0), 0),
      newestAt: new Date(newest).toISOString(),
    })
  }
  return orphans
}
