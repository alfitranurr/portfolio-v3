'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Experience } from '@/lib/types'
import { hasSupabaseConfig } from './_shared'

export async function saveExperienceAction(expData: {
  id?: string;
  role?: string;
  company?: string;
  location?: string | null;
  start_date?: string;
  end_date?: string | null;
  description?: string | string[];
  is_current?: boolean | null;
  category?: 'professional' | 'committee_organization' | null;
  logo_url?: string | null;
}) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockExpStr = cookieStore.get('mock_experience')?.value
    let list = mockExpStr ? JSON.parse(mockExpStr) : null

    if (!list) {
      const { MOCK_EXPERIENCE } = await import('@/lib/data-service')
      list = MOCK_EXPERIENCE
    }

    if (expData.id && expData.id.startsWith('mock-') || list.some((e: Experience) => e.id === expData.id)) {
      list = list.map((e: Experience) => e.id === expData.id ? {
        ...e,
        role: expData.role || e.role,
        company: expData.company || e.company,
        location: expData.location !== undefined ? expData.location : e.location,
        start_date: expData.start_date || e.start_date,
        end_date: expData.end_date !== undefined ? expData.end_date : e.end_date,
        description: Array.isArray(expData.description)
          ? expData.description
          : (expData.description ? String(expData.description).split('\n').filter(Boolean) : e.description),
        is_current: expData.is_current ?? e.is_current,
        category: (expData.category === 'professional' || expData.category === 'committee_organization')
          ? expData.category
          : e.category,
        logo_url: expData.logo_url !== undefined ? expData.logo_url : e.logo_url
      } : e)
    } else {
      const newExp: Experience = {
        id: `mock-exp-${Date.now()}`,
        role: expData.role || '',
        company: expData.company || '',
        location: expData.location || null,
        start_date: expData.start_date || '',
        end_date: expData.end_date || null,
        description: Array.isArray(expData.description)
          ? expData.description
          : (expData.description ? String(expData.description).split('\n').filter(Boolean) : []),
        is_current: !!expData.is_current,
        category: (expData.category === 'professional' || expData.category === 'committee_organization')
          ? expData.category
          : 'professional',
        logo_url: expData.logo_url || null
      }
      list.push(newExp)
    }

    cookieStore.set('mock_experience', JSON.stringify(list), { path: '/' })
    revalidatePath('/experience')
    revalidatePath('/admin/experience')
    return { success: true, message: 'Experience saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const isEdit = !!expData.id && !expData.id.startsWith('mock-')

    const dbPayload = {
      role: expData.role || '',
      company: expData.company || '',
      location: expData.location || null,
      start_date: expData.start_date || '',
      end_date: expData.end_date || null,
      description: Array.isArray(expData.description)
        ? expData.description
        : (expData.description ? String(expData.description).split('\n').filter(Boolean) : []),
      is_current: !!expData.is_current,
      category: expData.category || 'professional',
      logo_url: expData.logo_url || null,
      updated_at: new Date().toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('experiences')
        .update(dbPayload)
        .eq('id', expData.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('experiences')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
      error = err
    }

    if (error) throw error

    revalidatePath('/experience')
    revalidatePath('/admin/experience')
    return { success: true, message: 'Experience saved successfully.' }
  } catch (err) {
    console.error('saveExperienceAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteExperienceAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockExpStr = cookieStore.get('mock_experience')?.value
    if (mockExpStr) {
      const list = JSON.parse(mockExpStr)
      const updated = list.filter((e: Experience) => e.id !== id)
      cookieStore.set('mock_experience', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/experience')
    revalidatePath('/admin/experience')
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
      .from('experiences')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/experience')
    revalidatePath('/admin/experience')
    return { success: true }
  } catch (err) {
    console.error('deleteExperienceAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
