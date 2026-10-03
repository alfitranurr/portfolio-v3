'use client'

// Satu pintu upload gambar untuk semua form admin.
// Raster (JPG/PNG/WebP/HEIC yang bisa dibaca browser) → varian WebP responsif.
// SVG/GIF/ICO → upload apa adanya.

import { uploadAssetAction, uploadImageVariantsAction } from '@/app/admin/actions'
import { processImageFile, type ImageVariantBlob } from './image-processing'
import type { UploadPrefix } from './image-variants'

export interface UploadImageResult {
  success: boolean
  /** URL yang disimpan di DB (varian terbesar, atau file asli untuk passthrough) */
  url?: string
  error?: string
  /** Dimensi asli gambar sumber (px), untuk peringatan resolusi */
  sourceWidth?: number
  sourceHeight?: number
}

// Di bawah batas server (4 MB per batch, body Vercel 4.5 MB)
const BATCH_BYTES = 3.5 * 1024 * 1024

function toBatches(variants: ImageVariantBlob[]): ImageVariantBlob[][] {
  const batches: ImageVariantBlob[][] = []
  let current: ImageVariantBlob[] = []
  let size = 0
  for (const v of variants) {
    if (current.length && size + v.blob.size > BATCH_BYTES) {
      batches.push(current)
      current = []
      size = 0
    }
    current.push(v)
    size += v.blob.size
  }
  if (current.length) batches.push(current)
  return batches
}

export async function uploadImage(file: File, prefix: UploadPrefix): Promise<UploadImageResult> {
  try {
    const processed = await processImageFile(file)

    if (processed.kind === 'passthrough') {
      const fd = new FormData()
      fd.append('file', processed.file)
      fd.append('prefix', prefix)
      return await uploadAssetAction(fd)
    }

    const key = `${prefix}-${Date.now()}`
    const urls: Record<number, string> = {}
    for (const batch of toBatches(processed.variants)) {
      const fd = new FormData()
      fd.append('key', key)
      for (const v of batch) {
        fd.append('variant', new File([v.blob], `w${v.width}.${v.ext}`, { type: v.blob.type }))
      }
      const res = await uploadImageVariantsAction(fd)
      if (!res.success) return { success: false, error: res.error }
      Object.assign(urls, res.urls)
    }

    const maxWidth = Math.max(...processed.variants.map((v) => v.width))
    const url = urls[maxWidth]
    if (!url) return { success: false, error: 'Upload incomplete: largest variant missing' }
    return { success: true, url, sourceWidth: processed.sourceWidth, sourceHeight: processed.sourceHeight }
  } catch (err) {
    console.error('uploadImage error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
