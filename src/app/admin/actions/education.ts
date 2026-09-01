'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Education } from '@/lib/types'
import { hasSupabaseConfig } from './_shared'

export async function saveEducationAction(eduData: Partial<Education>) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockEduStr = cookieStore.get('mock_education')?.value
    let list = mockEduStr ? JSON.parse(mockEduStr) : null

    if (!list) {
      const { MOCK_EDUCATION } = await import('@/lib/data-service')
      list = MOCK_EDUCATION
    }

    if (eduData.id && eduData.id.startsWith('mock-') || list.some((e: Education) => e.id === eduData.id)) {
      list = list.map((e: Education) => e.id === eduData.id ? { ...e, ...eduData, updated_at: new Date().toISOString() } : e)
    } else {
      const newEdu = {
        ...eduData,
        id: `mock-edu-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      list.push(newEdu)
    }

    cookieStore.set('mock_education', JSON.stringify(list), { path: '/' })
    revalidatePath('/education')
    revalidatePath('/admin/education')
    return { success: true, message: 'Education history saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const isEdit = !!eduData.id && !eduData.id.startsWith('mock-')

    const dbPayload = {
      institution: eduData.institution || '',
      degree: eduData.degree || '',
      field_of_study: eduData.field_of_study || null,
      location: eduData.location || null,
      start_date: eduData.start_date || '',
      end_date: eduData.end_date || null,
      gpa: eduData.gpa ? String(eduData.gpa) : null,
      description: eduData.description || null,
      logo_url: eduData.logo_url || null,
      updated_at: new Date().toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('education')
        .update(dbPayload)
        .eq('id', eduData.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('education')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
      error = err
    }

    if (error) throw error

    revalidatePath('/education')
    revalidatePath('/admin/education')
    return { success: true, message: 'Education history saved successfully.' }
  } catch (err) {
    console.error('saveEducationAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteEducationAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockEduStr = cookieStore.get('mock_education')?.value
    if (mockEduStr) {
      const list = JSON.parse(mockEduStr)
      const updated = list.filter((e: Education) => e.id !== id)
      cookieStore.set('mock_education', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/education')
    revalidatePath('/admin/education')
    return { success: true }
  }

  if (id.startsWith('mock-')) {
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/education')
    revalidatePath('/admin/education')
    return { success: true }
  } catch (err) {
    console.error('deleteEducationAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
