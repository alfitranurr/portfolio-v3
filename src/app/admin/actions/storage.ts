'use server'

import { hasSupabaseConfig, requireAdmin } from './_shared'
import { findOrphanVariantFolders, isFreshUploadUrl, removeFileIfUnused } from './_storage'
import { STORAGE_BUCKET } from '@/lib/image-variants'

const MAX_DISCARD = 20

/**
 * Dipanggil saat form admin ditutup (Cancel / Save / pindah halaman) dengan URL yang
 * diupload selama form terbuka. File yang sudah tersimpan di DB otomatis dilewati
 * (removeFileIfUnused mengecek referensi), jadi yang terhapus hanya upload yang dibatalkan.
 */
export async function discardUploadsAction(urls: string[]) {
  if (!hasSupabaseConfig()) return { success: true, checked: 0 }
  const candidates = [...new Set(urls)].filter(isFreshUploadUrl).slice(0, MAX_DISCARD)
  if (candidates.length === 0) return { success: true, checked: 0 }

  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Unauthorized' }
  for (const url of candidates) {
    await removeFileIfUnused(admin.supabase, url)
  }
  return { success: true, checked: candidates.length }
}

/** Pindai folder varian yatim (tidak dirujuk DB, berumur > 24 jam). */
export async function scanOrphanUploadsAction() {
  if (!hasSupabaseConfig()) return { success: true as const, count: 0, bytes: 0 }
  try {
    const admin = await requireAdmin()
    if (!admin) return { success: false as const, error: 'Unauthorized' }
    const orphans = await findOrphanVariantFolders(admin.supabase)
    return { success: true as const, count: orphans.length, bytes: orphans.reduce((s, o) => s + o.bytes, 0) }
  } catch (err) {
    console.error('scanOrphanUploadsAction error:', err)
    return { success: false as const, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Hapus folder varian yatim. Daftar dihitung ulang di server (tidak menerima path dari client). */
export async function deleteOrphanUploadsAction() {
  if (!hasSupabaseConfig()) return { success: true as const, deleted: 0, bytes: 0 }
  try {
    const admin = await requireAdmin()
    if (!admin) return { success: false as const, error: 'Unauthorized' }
    const orphans = await findOrphanVariantFolders(admin.supabase)
    const paths = orphans.flatMap((o) => o.paths)
    const storage = admin.supabase.storage.from(STORAGE_BUCKET)
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await storage.remove(paths.slice(i, i + 100))
      if (error) throw error
    }
    return { success: true as const, deleted: orphans.length, bytes: orphans.reduce((s, o) => s + o.bytes, 0) }
  } catch (err) {
    console.error('deleteOrphanUploadsAction error:', err)
    return { success: false as const, error: err instanceof Error ? err.message : String(err) }
  }
}
