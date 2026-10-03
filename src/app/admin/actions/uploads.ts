'use server'

import { hasSupabaseConfig, requireAdmin, STORAGE_CACHE_CONTROL } from './_shared'
import {
  MAX_IMAGE_WIDTH,
  STORAGE_BUCKET,
  UPLOAD_PREFIXES,
  VARIANT_KEY_RE,
  VARIANT_WIDTHS,
  variantPath,
} from '@/lib/image-variants'

/**
 * Upload file apa adanya (tanpa varian). Dipakai untuk SVG / GIF / ICO yang tidak
 * diproses di browser — gambar raster lain lewat uploadImageVariantsAction.
 */
export async function uploadAssetAction(formData: FormData) {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico']
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'File type not allowed. Only images (JPG, PNG, WebP, GIF, SVG, ICO) are accepted.' }
  }
  if (file.size > 4 * 1024 * 1024) {
    return { success: false, error: 'File too large. Maximum 4MB.' }
  }
  const prefix = (formData.get('prefix') as string) || 'edu-logo'
  if (!(UPLOAD_PREFIXES as readonly string[]).includes(prefix)) {
    return { success: false, error: 'Invalid upload prefix' }
  }

  if (!hasSupabaseConfig()) {
    try {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      return { success: true, url: dataUrl }
    } catch {
      return { success: false, error: 'Failed to read file in mock mode' }
    }
  }

  try {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized admin user' }
    }
    const { supabase } = admin

    const fileName = `${prefix}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, { upsert: true, contentType: file.type, cacheControl: STORAGE_CACHE_CONTROL })

    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (err) {
    console.error('uploadAssetAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// Batas body Vercel Function 4.5 MB — client mengirim varian dalam beberapa batch.
const MAX_VARIANT_BYTES = 3.5 * 1024 * 1024
const MAX_BATCH_BYTES = 4 * 1024 * 1024
const VARIANT_NAME_RE = /^w(\d{2,4})\.(webp|jpg)$/
const VARIANT_MIME = { webp: 'image/webp', jpg: 'image/jpeg' } as const

function hasImageSignature(bytes: Uint8Array, ext: 'webp' | 'jpg'): boolean {
  if (ext === 'jpg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to))
  return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
}

/**
 * Upload satu batch varian responsif ke `opt/<key>/w<lebar>.<ext>` (lihat image-variants.ts).
 * Form fields: `key` (`<prefix>-<timestamp>`), `variant` (File, bisa berulang, nama `w<lebar>.<ext>`).
 * Return: `{ success, urls: { [lebar]: publicUrl } }`.
 */
export async function uploadImageVariantsAction(formData: FormData): Promise<
  { success: true; urls: Record<number, string> } | { success: false; error: string }
> {
  const key = String(formData.get('key') || '')
  if (!VARIANT_KEY_RE.test(key)) {
    return { success: false, error: 'Invalid upload key' }
  }

  const files = formData.getAll('variant').filter((f): f is File => f instanceof File)
  if (files.length === 0 || files.length > VARIANT_WIDTHS.length) {
    return { success: false, error: 'Invalid number of image variants' }
  }

  const parsed: { file: File; width: number; ext: 'webp' | 'jpg'; bytes: Uint8Array }[] = []
  let total = 0
  for (const file of files) {
    const m = file.name.match(VARIANT_NAME_RE)
    const width = m ? Number(m[1]) : 0
    const ext = m?.[2] as 'webp' | 'jpg' | undefined
    if (!ext || width < 1 || width > MAX_IMAGE_WIDTH || file.type !== VARIANT_MIME[ext]) {
      return { success: false, error: `Invalid variant file: ${file.name}` }
    }
    if (file.size === 0 || file.size > MAX_VARIANT_BYTES) {
      return { success: false, error: `Variant too large: ${file.name}` }
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    if (!hasImageSignature(bytes, ext)) {
      return { success: false, error: `Variant is not a valid ${ext} image: ${file.name}` }
    }
    total += file.size
    parsed.push({ file, width, ext, bytes })
  }
  if (total > MAX_BATCH_BYTES) {
    return { success: false, error: 'Upload batch too large' }
  }

  if (!hasSupabaseConfig()) {
    const urls: Record<number, string> = {}
    for (const p of parsed) {
      urls[p.width] = `data:${VARIANT_MIME[p.ext]};base64,${Buffer.from(p.bytes).toString('base64')}`
    }
    return { success: true, urls }
  }

  try {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized admin user' }
    }
    const storage = admin.supabase.storage.from(STORAGE_BUCKET)

    const entries = await Promise.all(
      parsed.map(async (p) => {
        const path = variantPath(key, p.width, p.ext)
        const { error } = await storage.upload(path, p.bytes, {
          contentType: VARIANT_MIME[p.ext],
          cacheControl: STORAGE_CACHE_CONTROL,
          upsert: false,
        })
        if (error) throw error
        return [p.width, storage.getPublicUrl(path).data.publicUrl] as const
      })
    )
    return { success: true, urls: Object.fromEntries(entries) }
  } catch (err) {
    console.error('uploadImageVariantsAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
