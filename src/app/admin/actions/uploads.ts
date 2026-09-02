'use server'

import { hasSupabaseConfig, requireAdmin } from './_shared'

export async function uploadAssetAction(formData: FormData) {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
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
