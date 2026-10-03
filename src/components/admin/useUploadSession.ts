'use client'

import * as React from 'react'
import { discardUploadsAction } from '@/app/admin/actions'

/**
 * Mencatat gambar yang diupload selama form admin terbuka. Saat form ditutup (Cancel,
 * Save, atau pindah halaman) semua URL itu dikirim ke server: yang sudah tersimpan di DB
 * dilewati, sisanya (upload yang dibatalkan / diganti sebelum Save) dihapus dari storage.
 *
 * @returns fungsi `trackUpload(url)` — panggil setiap kali upload berhasil.
 */
export function useUploadSession() {
  // Objek mutable via useState (bukan ref) agar cleanup selalu membaca daftar terbaru
  const [session] = React.useState(() => ({ urls: [] as string[] }))

  React.useEffect(() => {
    return () => {
      const urls = session.urls.splice(0)
      if (urls.length > 0) {
        discardUploadsAction(urls).catch((err) => console.warn('discardUploadsAction failed:', err))
      }
    }
  }, [session])

  return React.useCallback(
    (url: string | null | undefined) => {
      if (url && url.startsWith('http')) session.urls.push(url)
    },
    [session]
  )
}
