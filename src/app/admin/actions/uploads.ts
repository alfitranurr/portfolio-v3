'use server'

import { hasSupabaseConfig, requireAdmin } from './_shared'

export async function uploadAssetAction(formData: FormData) {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'File type not allowed. Only images (JPG, PNG, WebP, GIF, SVG) are accepted.' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File too large. Maximum 5MB.' }
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

    const prefix = formData.get('prefix') as string || 'edu-logo'
    const ext = file.name.split('.').pop()
    const fileName = `${prefix}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (err) {
    console.error('uploadAssetAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
