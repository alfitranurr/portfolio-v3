'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

function getMockMessages(cookieStore: any) {
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
    const updated = list.map((m: any) => m.id === id ? { ...m, is_read: isRead } : m)
    cookieStore.set('mock_messages', JSON.stringify(updated), { path: '/' })
    revalidatePath('/admin')
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('messages')
      .update({ is_read: isRead })
      .eq('id', id)
    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('toggleMessageReadAction error:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteMessageAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const list = getMockMessages(cookieStore)
    const updated = list.filter((m: any) => m.id !== id)
    cookieStore.set('mock_messages', JSON.stringify(updated), { path: '/' })
    revalidatePath('/admin')
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('deleteMessageAction error:', err)
    return { success: false, error: err.message }
  }
}

// ----------------------------------------------------
// 2. PROFILE ACTIONS
// ----------------------------------------------------

export async function updateProfileAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const headline = formData.get('headline') as string
  const about_me = formData.get('about_me') as string
  const instagram_url = formData.get('instagram_url') as string
  const linkedin_url = formData.get('linkedin_url') as string
  const github_url = formData.get('github_url') as string
  const avatarFile = formData.get('avatar_file') as File | null
  const resumeFile = formData.get('resume_file') as File | null

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
      instagram_url: "https://www.instagram.com/rmdhani_ii",
      linkedin_url: "https://www.linkedin.com/in/al-fitra-nur-ramadhani/",
      github_url: "https://github.com/alfitranurr"
    }

    const updated = {
      ...existing,
      name,
      headline,
      about_me,
      instagram_url,
      linkedin_url,
      github_url
    }

    // Mock upload by simulating data URLs or storing file names
    if (avatarFile && avatarFile.size > 0) {
      updated.avatar_url = `/mock-avatar.png` // Simulator path
    }
    if (resumeFile && resumeFile.size > 0) {
      updated.resume_url = `/mock-resume.pdf` // Simulator path
    }

    cookieStore.set('mock_profile', JSON.stringify(updated), { path: '/' })
    revalidatePath('/')
    revalidatePath('/admin/profile')
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
        instagram_url,
        linkedin_url,
        github_url,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin/profile')
    return { success: true, message: 'Profile updated successfully.' }
  } catch (err: any) {
    console.error('updateProfileAction error:', err)
    return { success: false, error: err.message }
  }
}

// ----------------------------------------------------
// 3. PROJECTS ACTIONS
// ----------------------------------------------------

export async function saveProjectAction(projectData: any) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockProjectsStr = cookieStore.get('mock_projects')?.value
    let list = mockProjectsStr ? JSON.parse(mockProjectsStr) : null
    
    // fallback import if cookie is empty
    if (!list) {
      const { MOCK_PROJECTS } = await import('@/lib/data-service')
      list = MOCK_PROJECTS
    }

    if (projectData.id && projectData.id.startsWith('mock-') || list.some((p: any) => p.id === projectData.id)) {
      list = list.map((p: any) => p.id === projectData.id ? { ...p, ...projectData, updated_at: new Date().toISOString() } : p)
    } else {
      const newProj = {
        ...projectData,
        id: `mock-proj-${Date.now()}`,
        created_at: projectData.created_at ? new Date(projectData.created_at).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      list.push(newProj)
    }

    cookieStore.set('mock_projects', JSON.stringify(list), { path: '/' })
    revalidatePath('/projects')
    revalidatePath(`/projects/${projectData.id}`)
    revalidatePath('/admin/projects')
    return { success: true, message: 'Project saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const isEdit = !!projectData.id && !projectData.id.startsWith('mock-')
    
    const dbPayload: any = {
      title: projectData.title,
      description: projectData.description,
      content: projectData.content,
      category: projectData.category,
      sub_category: projectData.sub_category,
      cover_image: projectData.cover_image,
      github_url: projectData.github_url,
      demo_url: projectData.demo_url,
      notebook_url: projectData.notebook_url,
      slide_url: projectData.slide_url,
      embed_code: projectData.embed_code,
      is_featured: projectData.is_featured,
      pinned_order: parseInt(projectData.pinned_order) || 0,
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

    revalidatePath('/projects')
    if (isEdit) revalidatePath(`/projects/${projectData.id}`)
    revalidatePath('/admin/projects')
    return { success: true, message: 'Project saved successfully.' }
  } catch (err: any) {
    console.error('saveProjectAction error:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteProjectAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockProjectsStr = cookieStore.get('mock_projects')?.value
    if (mockProjectsStr) {
      const list = JSON.parse(mockProjectsStr)
      const updated = list.filter((p: any) => p.id !== id)
      cookieStore.set('mock_projects', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
    return { success: true }
  }

  if (id.startsWith('mock-')) {
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/projects')
    revalidatePath('/admin/projects')
    return { success: true }
  } catch (err: any) {
    console.error('deleteProjectAction error:', err)
    return { success: false, error: err.message }
  }
}

// ----------------------------------------------------
// 4. EDUCATION ACTIONS
// ----------------------------------------------------

export async function saveEducationAction(eduData: any) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockEduStr = cookieStore.get('mock_education')?.value
    let list = mockEduStr ? JSON.parse(mockEduStr) : null
    
    if (!list) {
      const { MOCK_EDUCATION } = await import('@/lib/data-service')
      list = MOCK_EDUCATION
    }

    if (eduData.id && eduData.id.startsWith('mock-') || list.some((e: any) => e.id === eduData.id)) {
      list = list.map((e: any) => e.id === eduData.id ? { ...e, ...eduData, updated_at: new Date().toISOString() } : e)
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
    const isEdit = !!eduData.id && !eduData.id.startsWith('mock-')

    const dbPayload = {
      institution: eduData.institution,
      degree: eduData.degree,
      field_of_study: eduData.field_of_study,
      location: eduData.location,
      start_date: eduData.start_date,
      end_date: eduData.end_date || null,
      gpa: eduData.gpa ? String(eduData.gpa) : null,
      description: eduData.description,
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
  } catch (err: any) {
    console.error('saveEducationAction error:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteEducationAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockEduStr = cookieStore.get('mock_education')?.value
    if (mockEduStr) {
      const list = JSON.parse(mockEduStr)
      const updated = list.filter((e: any) => e.id !== id)
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
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/education')
    revalidatePath('/admin/education')
    return { success: true }
  } catch (err: any) {
    console.error('deleteEducationAction error:', err)
    return { success: false, error: err.message }
  }
}

// ----------------------------------------------------
// 5. EXPERIENCE ACTIONS
// ----------------------------------------------------

export async function saveExperienceAction(expData: any) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockExpStr = cookieStore.get('mock_experience')?.value
    let list = mockExpStr ? JSON.parse(mockExpStr) : null
    
    if (!list) {
      const { MOCK_EXPERIENCE } = await import('@/lib/data-service')
      list = MOCK_EXPERIENCE
    }

    if (expData.id && expData.id.startsWith('mock-') || list.some((e: any) => e.id === expData.id)) {
      list = list.map((e: any) => e.id === expData.id ? { ...e, ...expData, updated_at: new Date().toISOString() } : e)
    } else {
      const newExp = {
        ...expData,
        id: `mock-exp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
    const isEdit = !!expData.id && !expData.id.startsWith('mock-')

    const dbPayload = {
      role: expData.role,
      company: expData.company,
      location: expData.location,
      start_date: expData.start_date,
      end_date: expData.end_date || null,
      description: Array.isArray(expData.description) ? expData.description : expData.description.split('\n').filter(Boolean),
      is_current: expData.is_current,
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
  } catch (err: any) {
    console.error('saveExperienceAction error:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteExperienceAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockExpStr = cookieStore.get('mock_experience')?.value
    if (mockExpStr) {
      const list = JSON.parse(mockExpStr)
      const updated = list.filter((e: any) => e.id !== id)
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
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/experience')
    revalidatePath('/admin/experience')
    return { success: true }
  } catch (err: any) {
    console.error('deleteExperienceAction error:', err)
    return { success: false, error: err.message }
  }
}

// ----------------------------------------------------
// 6. CERTIFICATE ACTIONS
// ----------------------------------------------------

export async function saveCertificateAction(certData: any) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockCertStr = cookieStore.get('mock_certificates')?.value
    let list = mockCertStr ? JSON.parse(mockCertStr) : null
    
    if (!list) {
      const { MOCK_CERTIFICATES } = await import('@/lib/data-service')
      list = MOCK_CERTIFICATES
    }

    if (certData.id && certData.id.startsWith('mock-') || list.some((c: any) => c.id === certData.id)) {
      list = list.map((c: any) => c.id === certData.id ? { ...c, ...certData, updated_at: new Date().toISOString() } : c)
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
    const isEdit = !!certData.id && !certData.id.startsWith('mock-')

    const dbPayload = {
      title: certData.title,
      issuer: certData.issuer,
      issue_date: certData.issue_date,
      credential_url: certData.credential_url,
      credential_id: certData.credential_id,
      category: certData.category,
      image_url: certData.image_url,
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
  } catch (err: any) {
    console.error('saveCertificateAction error:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteCertificateAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockCertStr = cookieStore.get('mock_certificates')?.value
    if (mockCertStr) {
      const list = JSON.parse(mockCertStr)
      const updated = list.filter((c: any) => c.id !== id)
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
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true }
  } catch (err: any) {
    console.error('deleteCertificateAction error:', err)
    return { success: false, error: err.message }
  }
}

export async function uploadAssetAction(formData: FormData) {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    try {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      return { success: true, url: dataUrl }
    } catch (e: any) {
      console.error('Mock upload fail', e)
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
  } catch (err: any) {
    console.error('uploadAssetAction error:', err)
    return { success: false, error: err.message }
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
  const res = await saveAISettings(settings)
  revalidatePath('/admin/ai-settings')
  return res
}

export async function getAIChatLogsAction() {
  return await getAIChatLogs()
}

export async function clearAIChatLogsAction() {
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

export async function saveSkillAction(skillData: any) {
  const name = skillData.name ? skillData.name.trim() : ''
  const category = skillData.category ? skillData.category.trim() : ''
  const level = parseInt(skillData.level) || 50
  const desc = skillData.desc ? skillData.desc.trim() : ''
  let svg_path = skillData.svg_path ? skillData.svg_path.trim() : ''

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
      list = TECH_STACK.map((item: any, idx: number) => ({
        id: `mock-skill-${idx + 1}`,
        name: item.name,
        category: item.category,
        level: item.level,
        desc: item.desc,
        svg_path: null
      }))
    }

    const isEdit = !!skillData.id && (skillData.id.startsWith('mock-') || list.some((s: any) => s.id === skillData.id))

    if (isEdit) {
      list = list.map((s: any) => 
        s.id === skillData.id 
          ? { ...s, name, category, level, desc, svg_path, updated_at: new Date().toISOString() } 
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
    const isEdit = !!skillData.id && !skillData.id.startsWith('mock-')

    const dbPayload = {
      name,
      category,
      level,
      desc,
      svg_path: svg_path || null,
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
  } catch (err: any) {
    console.error('saveSkillAction error:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteSkillAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockSkillsStr = cookieStore.get('mock_skills')?.value
    if (mockSkillsStr) {
      const list = JSON.parse(mockSkillsStr)
      const updated = list.filter((s: any) => s.id !== id)
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
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/')
    revalidatePath('/admin/skills')
    return { success: true }
  } catch (err: any) {
    console.error('deleteSkillAction error:', err)
    return { success: false, error: err.message }
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
  } catch (err: any) {
    console.error('trackPageViewAction error:', err)
    return { success: false, error: err.message }
  }
}




