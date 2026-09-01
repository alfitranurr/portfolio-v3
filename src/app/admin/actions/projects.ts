'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Project } from '@/lib/types'
import { hasSupabaseConfig } from './_shared'

export async function saveProjectAction(projectData: {
  id?: string;
  title?: string;
  description?: string;
  content?: string | null;
  category?: 'data' | 'non-data' | null;
  sub_category?: string;
  cover_image?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  notebook_url?: string | null;
  slide_url?: string | null;
  embed_code?: string | null;
  is_featured?: boolean | null;
  is_on_progress?: boolean | null;
  pinned_order?: string | number | null;
  featured_order?: string | number | null;
  created_at?: string;
}) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockProjectsStr = cookieStore.get('mock_projects')?.value
    let list = mockProjectsStr ? JSON.parse(mockProjectsStr) : null

    // fallback import if cookie is empty
    if (!list) {
      const { MOCK_PROJECTS } = await import('@/lib/data-service')
      list = MOCK_PROJECTS
    }

    if (projectData.id && projectData.id.startsWith('mock-') || list.some((p: Project) => p.id === projectData.id)) {
      list = list.map((p: Project) => {
        if (p.id === projectData.id) {
          let pinnedOrder = parseInt(String(projectData.pinned_order)) || p.pinned_order || 0
          if (pinnedOrder <= 0) {
            const category = (projectData.category === 'data' || projectData.category === 'non-data') ? projectData.category : p.category
            const catProjects = list.filter((item: Project) => item.category === category && item.id !== p.id)
            const maxPin = catProjects.reduce((max: number, item: Project) => Math.max(max, item.pinned_order || 0), 0)
            pinnedOrder = maxPin + 1
          }
          return {
            ...p,
            title: projectData.title || p.title,
            description: projectData.description || p.description,
            content: projectData.content !== undefined ? projectData.content : p.content,
            category: (projectData.category === 'data' || projectData.category === 'non-data') ? projectData.category : p.category,
            sub_category: projectData.sub_category || p.sub_category,
            cover_image: projectData.cover_image !== undefined ? projectData.cover_image : p.cover_image,
            github_url: projectData.github_url !== undefined ? projectData.github_url : p.github_url,
            demo_url: projectData.demo_url !== undefined ? projectData.demo_url : p.demo_url,
            notebook_url: projectData.notebook_url !== undefined ? projectData.notebook_url : p.notebook_url,
            slide_url: projectData.slide_url !== undefined ? projectData.slide_url : p.slide_url,
            embed_code: projectData.embed_code !== undefined ? projectData.embed_code : p.embed_code,
            is_featured: projectData.is_featured ?? p.is_featured,
            is_on_progress: projectData.is_on_progress ?? p.is_on_progress,
            pinned_order: pinnedOrder,
            featured_order: projectData.featured_order !== undefined ? parseInt(String(projectData.featured_order)) || 0 : (p.featured_order || 0)
          }
        }
        return p
      })
    } else {
      let pinnedOrder = parseInt(String(projectData.pinned_order)) || 0
      if (pinnedOrder <= 0) {
        const category = (projectData.category === 'data' || projectData.category === 'non-data') ? projectData.category : 'data'
        const catProjects = list.filter((item: Project) => item.category === category)
        const maxPin = catProjects.reduce((max: number, item: Project) => Math.max(max, item.pinned_order || 0), 0)
        pinnedOrder = maxPin + 1
      }
      const newProj: Project = {
        id: `mock-proj-${Date.now()}`,
        title: projectData.title || '',
        description: projectData.description || '',
        content: projectData.content || null,
        category: (projectData.category === 'data' || projectData.category === 'non-data') ? projectData.category : 'data',
        sub_category: projectData.sub_category || '',
        cover_image: projectData.cover_image || null,
        github_url: projectData.github_url || null,
        demo_url: projectData.demo_url || null,
        notebook_url: projectData.notebook_url || null,
        slide_url: projectData.slide_url || null,
        embed_code: projectData.embed_code || null,
        is_featured: !!projectData.is_featured,
        is_on_progress: !!projectData.is_on_progress,
        pinned_order: pinnedOrder,
        featured_order: parseInt(String(projectData.featured_order)) || 0,
        created_at: projectData.created_at ? new Date(projectData.created_at).toISOString() : new Date().toISOString()
      }
      list.push(newProj)
    }

    cookieStore.set('mock_projects', JSON.stringify(list), { path: '/' })
    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath(`/projects/${projectData.id}`)
    revalidatePath('/admin/projects')
    return { success: true, message: 'Project saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const isEdit = !!projectData.id && !projectData.id.startsWith('mock-')

    let pinnedOrder = parseInt(String(projectData.pinned_order)) || 0
    if (pinnedOrder <= 0) {
      const category = (projectData.category === 'data' || projectData.category === 'non-data') ? projectData.category : 'data'
      let query = supabase
          .from('projects')
          .select('pinned_order')
          .eq('category', category)

      if (isEdit) {
        query = query.neq('id', projectData.id)
      }

      const { data: catProjects } = await query
      const maxPin = catProjects ? catProjects.reduce((max: number, p: { pinned_order: number | null }) => Math.max(max, p.pinned_order || 0), 0) : 0
      pinnedOrder = maxPin + 1
    }

    const dbPayload: Omit<Project, 'id' | 'created_at'> & { created_at?: string; updated_at: string } = {
      title: projectData.title || '',
      description: projectData.description || '',
      content: projectData.content || null,
      category: (projectData.category === 'data' || projectData.category === 'non-data') ? projectData.category : 'data',
      sub_category: projectData.sub_category || '',
      cover_image: projectData.cover_image || null,
      github_url: projectData.github_url || null,
      demo_url: projectData.demo_url || null,
      notebook_url: projectData.notebook_url || null,
      slide_url: projectData.slide_url || null,
      embed_code: projectData.embed_code || null,
      is_featured: !!projectData.is_featured,
      is_on_progress: !!projectData.is_on_progress,
      pinned_order: pinnedOrder,
      featured_order: projectData.featured_order !== undefined ? parseInt(String(projectData.featured_order)) || 0 : undefined,
      updated_at: new Date().toISOString()
    }

    if (projectData.created_at) {
      dbPayload.created_at = new Date(projectData.created_at).toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('projects')
        .update(dbPayload)
        .eq('id', projectData.id)
      error = err
    } else {
      const insertPayload = { ...dbPayload }
      if (!insertPayload.created_at) {
        insertPayload.created_at = new Date().toISOString()
      }
      const { error: err } = await supabase
        .from('projects')
        .insert([insertPayload])
      error = err
    }

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/projects')
    if (isEdit) revalidatePath(`/projects/${projectData.id}`)
    revalidatePath('/admin/projects')
    return { success: true, message: 'Project saved successfully.' }
  } catch (err) {
    console.error('saveProjectAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteProjectAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockProjectsStr = cookieStore.get('mock_projects')?.value
    if (mockProjectsStr) {
      const list = JSON.parse(mockProjectsStr)
      const updated = list.filter((p: Project) => p.id !== id)
      cookieStore.set('mock_projects', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
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
      .from('projects')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
    return { success: true }
  } catch (err) {
    console.error('deleteProjectAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function updateProjectsOrderAction(updates: { id: string; pinned_order: number; is_featured?: boolean }[]) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockProjectsStr = cookieStore.get('mock_projects')?.value
    let list: Project[] = []
    if (mockProjectsStr) {
      list = JSON.parse(mockProjectsStr)
    } else {
      const { MOCK_PROJECTS } = await import('@/lib/data-service')
      list = MOCK_PROJECTS
    }

    // Update matching mock projects
    list = list.map((p: Project) => {
      const update = updates.find(u => u.id === p.id)
      if (update) {
        return {
          ...p,
          pinned_order: update.pinned_order,
          is_featured: update.is_featured !== undefined ? update.is_featured : p.is_featured
        }
      }
      return p
    })

    cookieStore.set('mock_projects', JSON.stringify(list), { path: '/' })
    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    await Promise.all(
      updates.map(async (update) => {
        if (update.id.startsWith('mock-')) return

        const payload: { pinned_order: number; updated_at: string; is_featured?: boolean } = {
          pinned_order: update.pinned_order,
          updated_at: new Date().toISOString()
        }
        if (update.is_featured !== undefined) {
          payload.is_featured = update.is_featured
        }

        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', update.id)
        if (error) throw error
      })
    )

    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
    return { success: true }
  } catch (err) {
    console.error('updateProjectsOrderAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function updateFeaturedProjectsOrderAction(updates: { id: string; featured_order: number; is_featured?: boolean }[]) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockProjectsStr = cookieStore.get('mock_projects')?.value
    let list: Project[] = []
    if (mockProjectsStr) {
      list = JSON.parse(mockProjectsStr)
    } else {
      const { MOCK_PROJECTS } = await import('@/lib/data-service')
      list = MOCK_PROJECTS
    }

    // Update matching mock projects
    list = list.map((p: Project) => {
      const update = updates.find(u => u.id === p.id)
      if (update) {
        return {
          ...p,
          featured_order: update.featured_order,
          is_featured: update.is_featured !== undefined ? update.is_featured : p.is_featured
        }
      }
      return p
    })

    cookieStore.set('mock_projects', JSON.stringify(list), { path: '/' })
    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    await Promise.all(
      updates.map(async (update) => {
        if (update.id.startsWith('mock-')) return

        const payload: { featured_order: number; updated_at: string; is_featured?: boolean } = {
          featured_order: update.featured_order,
          updated_at: new Date().toISOString()
        }
        if (update.is_featured !== undefined) {
          payload.is_featured = update.is_featured
        }

        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', update.id)
        if (error) throw error
      })
    )

    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
    return { success: true }
  } catch (err) {
    console.error('updateFeaturedProjectsOrderAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
