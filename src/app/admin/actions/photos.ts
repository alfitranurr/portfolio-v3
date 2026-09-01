'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Photo } from '@/lib/types'
import { hasSupabaseConfig } from './_shared'

export async function savePhotoAction(photoData: Partial<Photo>) {
  const title = photoData.title ? photoData.title.trim() : ''
  const year = photoData.year ? photoData.year.trim() : ''
  const description = photoData.description ? photoData.description.trim() : ''
  const image_url = photoData.image_url ? photoData.image_url.trim() : ''

  if (!image_url) {
    return { success: false, error: 'Image URL is required.' }
  }

  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockPhotosStr = cookieStore.get('mock_photos')?.value
    let list = mockPhotosStr ? JSON.parse(mockPhotosStr) : null

    if (!list) {
      const { MOCK_PHOTOS } = await import('@/lib/data-service')
      list = MOCK_PHOTOS
    }

    const isEdit = !!photoData.id && (photoData.id.startsWith('mock-') || list.some((p: Photo) => p.id === photoData.id))

    if (isEdit) {
      list = list.map((p: Photo) =>
        p.id === photoData.id
          ? { ...p, title, year, description, image_url, updated_at: new Date().toISOString() }
          : p
      )
    } else {
      const newPhoto = {
        id: `mock-photo-${Date.now()}`,
        title: title || null,
        year: year || null,
        description: description || null,
        image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      list.push(newPhoto)
    }

    cookieStore.set('mock_photos', JSON.stringify(list), { path: '/' })
    revalidatePath('/')
    revalidatePath('/admin/photos')
    return { success: true, message: 'Photo saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const isEdit = !!photoData.id && !photoData.id.startsWith('mock-')

    const dbPayload = {
      title: title || null,
      year: year || null,
      description: description || null,
      image_url,
      updated_at: new Date().toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('photos')
        .update(dbPayload)
        .eq('id', photoData.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('photos')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
      error = err
    }

    if (error) {
      const isTableMissing =
        error.code === '42P01' ||
        error.code?.startsWith('PGRST') ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist')

      if (isTableMissing) {
        console.warn('Supabase photos table not found during save. Storing in cookies instead.')
        const mockPhotosStr = cookieStore.get('mock_photos')?.value
        let list = mockPhotosStr ? JSON.parse(mockPhotosStr) : null
        if (!list) {
          const { MOCK_PHOTOS } = await import('@/lib/data-service')
          list = MOCK_PHOTOS
        }

        if (isEdit) {
          list = list.map((p: Photo) => p.id === photoData.id ? { ...p, ...dbPayload } : p)
        } else {
          list.push({ ...dbPayload, id: `mock-photo-${Date.now()}`, created_at: new Date().toISOString() })
        }
        cookieStore.set('mock_photos', JSON.stringify(list), { path: '/' })
        revalidatePath('/')
        revalidatePath('/admin/photos')
        return { success: true, message: 'Photo saved to browser cookies (Photos table is missing in database).' }
      }
      throw error
    }

    revalidatePath('/')
    revalidatePath('/admin/photos')
    return { success: true, message: 'Photo saved successfully.' }
  } catch (err) {
    console.error('savePhotoAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deletePhotoAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockPhotosStr = cookieStore.get('mock_photos')?.value
    if (mockPhotosStr) {
      const list = JSON.parse(mockPhotosStr)
      const updated = list.filter((p: Photo) => p.id !== id)
      cookieStore.set('mock_photos', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/')
    revalidatePath('/admin/photos')
    return { success: true }
  }

  if (id.startsWith('mock-')) {
    const mockPhotosStr = cookieStore.get('mock_photos')?.value
    if (mockPhotosStr) {
      const list = JSON.parse(mockPhotosStr)
      const updated = list.filter((p: Photo) => p.id !== id)
      cookieStore.set('mock_photos', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/')
    revalidatePath('/admin/photos')
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
    if (error) {
      const isTableMissing =
        error.code === '42P01' ||
        error.code?.startsWith('PGRST') ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist')

      if (isTableMissing) {
        const mockPhotosStr = cookieStore.get('mock_photos')?.value
        if (mockPhotosStr) {
          const list = JSON.parse(mockPhotosStr)
          const updated = list.filter((p: Photo) => p.id !== id)
          cookieStore.set('mock_photos', JSON.stringify(updated), { path: '/' })
        }
        revalidatePath('/')
        revalidatePath('/admin/photos')
        return { success: true }
      }
      throw error
    }
    revalidatePath('/')
    revalidatePath('/admin/photos')
    return { success: true }
  } catch (err) {
    console.error('deletePhotoAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
