'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Message, Project, Education, Experience, Certificate, Skill, Photo } from '@/lib/types'

// Helper checks if env variables exist
function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// ----------------------------------------------------
// 1. MESSAGES ACTIONS
// ----------------------------------------------------

function getMockMessages(cookieStore: Awaited<ReturnType<typeof cookies>>): Message[] {
  const mockMessages = cookieStore.get('mock_messages')?.value
  if (!mockMessages) {
    return [
      {
        id: "mock-msg-1",
        name: "John Doe",
        email: "johndoe@example.com",
        subject: "Inquiry about Machine Learning Consulting",
        message: "Hi Al Fitra, I saw your predictive customer churn project and I am interested in collaborating on a similar pipeline for our e-commerce business. Do you have availability next month?",
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "mock-msg-2",
        name: "Jane Smith",
        email: "janesmith@techcorp.com",
        subject: "Job Opportunity: Senior Data Scientist",
        message: "Hello! We are looking for a remote data science consultant to join our telemetry modeling team. Your portfolio is outstanding. Let's schedule a call.",
        is_read: true,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ]
  }
  return JSON.parse(mockMessages)
}

export async function getMessagesAction() {
  if (!hasSupabaseConfig()) {
    const cookieStore = await cookies()
    return getMockMessages(cookieStore)
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('getMessagesAction error:', err)
    return []
  }
}

export async function toggleMessageReadAction(id: string, isRead: boolean) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const list = getMockMessages(cookieStore)
    const updated = list.map((m: Message) => m.id === id ? { ...m, is_read: isRead } : m)
    cookieStore.set('mock_messages', JSON.stringify(updated), { path: '/' })
    revalidatePath('/admin')
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    const { error } = await supabase
      .from('messages')
      .update({ is_read: isRead })
      .eq('id', id)
    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('toggleMessageReadAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteMessageAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const list = getMockMessages(cookieStore)
    const updated = list.filter((m: Message) => m.id !== id)
    cookieStore.set('mock_messages', JSON.stringify(updated), { path: '/' })
    revalidatePath('/admin')
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('deleteMessageAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ----------------------------------------------------
// 2. PROFILE ACTIONS
// ----------------------------------------------------

export async function updateProfileAction(prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const headline = formData.get('headline') as string
  const about_me = formData.get('about_me') as string
  const instagram_url = formData.get('instagram_url') as string
  const linkedin_url = formData.get('linkedin_url') as string
  const github_url = formData.get('github_url') as string
  const skills_title = formData.get('skills_title') as string
  const skills_subtitle = formData.get('skills_subtitle') as string
  const avatarFile = formData.get('avatar_file') as File | null
  const resumeFile = formData.get('resume_file') as File | null
  const logoFile = formData.get('logo_file') as File | null

  if (!name || !headline) {
    return { success: false, error: 'Name and Headline are required.' }
  }

  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    // Get existing mock profile or fallback
    const existingStr = cookieStore.get('mock_profile')?.value
    const existing = existingStr ? JSON.parse(existingStr) : {
      name: "Al Fitra Nur Ramadhani",
      headline: "Data Science Professional",
      about_me: "Welcome to my portfolio! Update this in your admin panel.",
      avatar_url: null,
      resume_url: null,
      logo_url: null,
      instagram_url: "https://www.instagram.com/rmdhani_ii",
      linkedin_url: "https://www.linkedin.com/in/al-fitra-nur-ramadhani/",
      github_url: "https://github.com/alfitranurr",
      skills_title: "Tech stacks that i have used",
      skills_subtitle: "My technical toolkit and areas of expertise"
    }

    const updated = {
      ...existing,
      name,
      headline,
      about_me,
      instagram_url,
      linkedin_url,
      github_url,
      skills_title,
      skills_subtitle
    }

    // Mock upload by simulating data URLs or storing file names
    if (avatarFile && avatarFile.size > 0) {
      try {
        const buffer = await avatarFile.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        updated.avatar_url = `data:${avatarFile.type};base64,${base64}`
      } catch {
        updated.avatar_url = `/mock-avatar.png`
      }
    }
    if (resumeFile && resumeFile.size > 0) {
      updated.resume_url = `/mock-resume.pdf` // Simulator path
    }
    if (logoFile && logoFile.size > 0) {
      try {
        const buffer = await logoFile.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        updated.logo_url = `data:${logoFile.type};base64,${base64}`
      } catch {
        updated.logo_url = `/mock-logo.png`
      }
    }

    cookieStore.set('mock_profile', JSON.stringify(updated), { path: '/' })
    revalidatePath('/', 'layout')
    return { success: true, message: 'Profile updated successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized admin user' }
    }

    // Upload Files if provided
    let avatar_url = formData.get('avatar_url') as string || null
    let resume_url = formData.get('resume_url') as string || null
    let logo_url = formData.get('logo_url') as string || null

    if (avatarFile && avatarFile.size > 0) {
      const ext = avatarFile.name.split('.').pop()
      const fileName = `avatar-${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(fileName, avatarFile, { upsert: true, contentType: avatarFile.type })
      
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName)
      avatar_url = publicUrl
    }

    if (resumeFile && resumeFile.size > 0) {
      const ext = resumeFile.name.split('.').pop()
      const fileName = `resume-${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(fileName, resumeFile, { upsert: true, contentType: resumeFile.type })
      
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName)
      resume_url = publicUrl
    }

    if (logoFile && logoFile.size > 0) {
      const ext = logoFile.name.split('.').pop()
      const fileName = `logo-${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(fileName, logoFile, { upsert: true, contentType: logoFile.type })
      
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName)
      logo_url = publicUrl
    }

    // Upsert Profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        headline,
        about_me,
        avatar_url,
        resume_url,
        logo_url,
        instagram_url,
        linkedin_url,
        github_url,
        skills_title,
        skills_subtitle,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    revalidatePath('/', 'layout')
    return { success: true, message: 'Profile updated successfully.' }
  } catch (err) {
    console.error('updateProfileAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ----------------------------------------------------
// 3. PROJECTS ACTIONS
// ----------------------------------------------------

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

// ----------------------------------------------------
// 4. EDUCATION ACTIONS
// ----------------------------------------------------

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

// ----------------------------------------------------
// 5. EXPERIENCE ACTIONS
// ----------------------------------------------------

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

// ----------------------------------------------------
// 6. CERTIFICATE ACTIONS
// ----------------------------------------------------

export async function saveCertificateAction(certData: Partial<Certificate>) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockCertStr = cookieStore.get('mock_certificates')?.value
    let list = mockCertStr ? JSON.parse(mockCertStr) : null
    
    if (!list) {
      const { MOCK_CERTIFICATES } = await import('@/lib/data-service')
      list = MOCK_CERTIFICATES
    }

    if (certData.id && certData.id.startsWith('mock-') || list.some((c: Certificate) => c.id === certData.id)) {
      list = list.map((c: Certificate) => c.id === certData.id ? { ...c, ...certData, updated_at: new Date().toISOString() } : c)
    } else {
      const newCert = {
        ...certData,
        id: `mock-cert-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      list.push(newCert)
    }

    cookieStore.set('mock_certificates', JSON.stringify(list), { path: '/' })
    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true, message: 'Certificate saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const isEdit = !!certData.id && !certData.id.startsWith('mock-')

    const dbPayload = {
      title: certData.title || '',
      issuer: certData.issuer || '',
      issue_date: certData.issue_date || '',
      credential_url: certData.credential_url || null,
      credential_id: certData.credential_id || null,
      category: certData.category || 'license_certification',
      image_url: certData.image_url || null,
      updated_at: new Date().toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('certificates')
        .update(dbPayload)
        .eq('id', certData.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('certificates')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
      error = err
    }

    if (error) throw error

    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true, message: 'Certificate saved successfully.' }
  } catch (err) {
    console.error('saveCertificateAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteCertificateAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockCertStr = cookieStore.get('mock_certificates')?.value
    if (mockCertStr) {
      const list = JSON.parse(mockCertStr)
      const updated = list.filter((c: Certificate) => c.id !== id)
      cookieStore.set('mock_certificates', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
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
      .from('certificates')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true }
  } catch (err) {
    console.error('deleteCertificateAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

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
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized admin user' }
    }

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

// ----------------------------------------------------
// 7. AI SETTINGS & LOGS ACTIONS
// ----------------------------------------------------
import { 
  getAISettings, 
  saveAISettings, 
  getAIChatLogs, 
  clearAIChatLogs,
  AISettings 
} from '@/lib/ai-service'

export async function getAISettingsAction() {
  return await getAISettings()
}

export async function saveAISettingsAction(settings: AISettings) {
  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
  }
  const res = await saveAISettings(settings)
  revalidatePath('/admin/ai-settings')
  return res
}

export async function getAIChatLogsAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }
  }
  return await getAIChatLogs()
}

export async function clearAIChatLogsAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
  }
  const res = await clearAIChatLogs()
  revalidatePath('/admin/ai-settings')
  return res
}

// ----------------------------------------------------
// 8. TECH STACK (SKILLS) ACTIONS
// ----------------------------------------------------

function slugifyForSimpleIcons(name: string): string {
  let slug = name.toLowerCase().trim()
  if (slug === 'next.js' || slug === 'nextjs') return 'nextdotjs'
  if (slug === 'node.js' || slug === 'nodejs') return 'nodedotjs'
  if (slug === 'power bi' || slug === 'powerbi') return 'powerbi'
  if (slug === 'excel' || slug === 'microsoft excel') return 'microsoftexcel'
  if (slug === 'sql' || slug === 'postgresql' || slug === 'postgres') return 'postgresql'
  if (slug === 'mysql') return 'mysql'
  if (slug === 'mongodb' || slug === 'mongo') return 'mongodb'
  if (slug === 'sqlite') return 'sqlite'
  if (slug === 'docker') return 'docker'
  if (slug === 'kubernetes' || slug === 'k8s') return 'kubernetes'
  if (slug === 'aws' || slug === 'amazon web services') return 'amazonaws'
  if (slug === 'gcp' || slug === 'google cloud') return 'googlecloud'
  if (slug === 'azure') return 'microsoftazure'
  if (slug === 'sql server' || slug === 'microsoft sql server' || slug === 'mssql') return 'microsoftsqlserver'
  if (slug === 'big query' || slug === 'bigquery' || slug === 'google bigquery') return 'googlebigquery'
  if (slug === 'figma') return 'figma'
  if (slug === 'canva') return 'canva'

  slug = slug
    .replace(/\.js$/, 'dotjs')
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]/g, '')
  return slug
}

async function fetchSimpleIconPath(slug: string): Promise<string | null> {
  const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    const match = text.match(/d="([^"]+)"/)
    return match ? match[1] : null
  } catch (e) {
    console.error(`Error fetching simple icon for slug ${slug}:`, e)
    return null
  }
}

export async function saveSkillAction(skillData: Partial<Skill>) {
  const name = skillData.name ? skillData.name.trim() : ''
  const category = skillData.category ? skillData.category.trim() : ''
  const level = parseInt(String(skillData.level)) || 50
  const desc = skillData.desc ? skillData.desc.trim() : ''
  let svg_path = skillData.svg_path ? skillData.svg_path.trim() : ''
  const logo_url = skillData.logo_url ? skillData.logo_url.trim() : null

  if (!name || !category) {
    return { success: false, error: 'Name and Category are required.' }
  }

  // Auto-fetch logo if svg_path is empty
  if (!svg_path) {
    const slug = slugifyForSimpleIcons(name)
    try {
      const fetched = await fetchSimpleIconPath(slug)
      if (fetched) {
        svg_path = fetched
      }
    } catch (e) {
      console.warn('Failed auto-fetching logo path:', e)
    }
  }

  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockSkillsStr = cookieStore.get('mock_skills')?.value
    let list = mockSkillsStr ? JSON.parse(mockSkillsStr) : null

    if (!list) {
      const { TECH_STACK } = await import('@/lib/constants')
      list = TECH_STACK.map((item: { name: string; category: string; level: number; desc: string }, idx: number) => ({
        id: `mock-skill-${idx + 1}`,
        name: item.name,
        category: item.category,
        level: item.level,
        desc: item.desc,
        svg_path: null,
        logo_url: null
      }))
    }

    const isEdit = !!skillData.id && (skillData.id.startsWith('mock-') || list.some((s: Skill) => s.id === skillData.id))

    if (isEdit) {
      list = list.map((s: Skill) => 
        s.id === skillData.id 
          ? { ...s, name, category, level, desc, svg_path, logo_url, updated_at: new Date().toISOString() } 
          : s
      )
    } else {
      const newSkill = {
        id: `mock-skill-${Date.now()}`,
        name,
        category,
        level,
        desc,
        svg_path: svg_path || null,
        logo_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      list.push(newSkill)
    }

    cookieStore.set('mock_skills', JSON.stringify(list), { path: '/' })
    revalidatePath('/')
    revalidatePath('/admin/skills')
    return { success: true, message: 'Skill saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const isEdit = !!skillData.id && !skillData.id.startsWith('mock-')

    const dbPayload = {
      name,
      category,
      level,
      desc,
      svg_path: svg_path || null,
      logo_url,
      updated_at: new Date().toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('skills')
        .update(dbPayload)
        .eq('id', skillData.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('skills')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
      error = err
    }

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin/skills')
    return { success: true, message: 'Skill saved successfully.' }
  } catch (err) {
    console.error('saveSkillAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteSkillAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockSkillsStr = cookieStore.get('mock_skills')?.value
    if (mockSkillsStr) {
      const list = JSON.parse(mockSkillsStr)
      const updated = list.filter((s: Skill) => s.id !== id)
      cookieStore.set('mock_skills', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/')
    revalidatePath('/admin/skills')
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
      .from('skills')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/')
    revalidatePath('/admin/skills')
    return { success: true }
  } catch (err) {
    console.error('deleteSkillAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function updateSkillsTextAction(title: string, subtitle: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const existingStr = cookieStore.get('mock_profile')?.value
    const existing = existingStr ? JSON.parse(existingStr) : {
      name: "Al Fitra Nur Ramadhani",
      headline: "Data Science Professional",
      about_me: "Welcome to my portfolio! Update this in your admin panel.",
      avatar_url: null,
      resume_url: null,
      instagram_url: "https://www.instagram.com/rmdhani_ii",
      linkedin_url: "https://www.linkedin.com/in/al-fitra-nur-ramadhani/",
      github_url: "https://github.com/alfitranurr",
      skills_title: "Tech stacks that i have used",
      skills_subtitle: "My technical toolkit and areas of expertise"
    }

    const updated = {
      ...existing,
      skills_title: title,
      skills_subtitle: subtitle
    }

    cookieStore.set('mock_profile', JSON.stringify(updated), { path: '/' })
    revalidatePath('/')
    revalidatePath('/admin/skills')
    return { success: true, message: 'Tech Stack text updated successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized admin user' }
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        ...existingProfile,
        id: user.id,
        skills_title: title,
        skills_subtitle: subtitle,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin/skills')
    return { success: true, message: 'Tech Stack text updated successfully.' }
  } catch (err) {
    console.error('updateSkillsTextAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ----------------------------------------------------
// 9. VISITOR ANALYTICS ACTIONS
// ----------------------------------------------------

export async function trackPageViewAction(pagePath: string, visitorId: string) {
  if (!hasSupabaseConfig()) {
    return { success: true, message: 'Mock track successful.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('page_views')
      .insert([{ 
        visitor_id: visitorId, 
        page_path: pagePath,
        created_at: new Date().toISOString()
      }])
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, fail silently
        return { success: false, code: '42P01' }
      }
      throw error
    }
    return { success: true }
  } catch (err) {
    console.error('trackPageViewAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function getVisitorStatsAction() {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return { success: false, error: 'Unauthorized' }
      }
    } catch {
      return { success: false, error: 'Unauthorized' }
    }
  }

  try {
    const { getVisitorStats } = await import('@/lib/data-service')
    const stats = await getVisitorStats()
    return { success: true, data: stats }
  } catch (err) {
    console.error('getVisitorStatsAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function resetVisitorAnalyticsAction() {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        return { success: false, error: 'Unauthorized' }
      }

      // 1. Try database RPC reset function first (bypasses RLS issues)
      const { error: rpcErr } = await supabase.rpc('reset_visitor_analytics')
      
      if (!rpcErr) {
        return { success: true }
      }

      // 2. Fallback to direct DELETE query
      const { error } = await supabase
        .from('page_views')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        if (error.code === '42P01') {
          return { success: true, message: 'Table does not exist yet' }
        }
        throw error
      }
      return { success: true }
    } catch (err) {
      console.error('resetVisitorAnalyticsAction error:', err)
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return { success: true }
}

export async function getMonthlyVisitorStatsAction(year: number) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return { success: false, error: 'Unauthorized' }
      }
    } catch {
      return { success: false, error: 'Unauthorized' }
    }
  }

  try {
    const { getMonthlyVisitorStats } = await import('@/lib/data-service')
    const stats = await getMonthlyVisitorStats(year)
    return { success: true, data: stats }
  } catch (err) {
    console.error('getMonthlyVisitorStatsAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function getAvailableYearsAction() {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return { success: false, error: 'Unauthorized' }
      }
    } catch {
      return { success: false, error: 'Unauthorized' }
    }
  }

  try {
    const { getAvailableYears } = await import('@/lib/data-service')
    const years = await getAvailableYears()
    return { success: true, data: years }
  } catch (err) {
    console.error('getAvailableYearsAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ----------------------------------------------------
// 10. PHOTO / MOMENT RECAP ACTIONS
// ----------------------------------------------------

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




