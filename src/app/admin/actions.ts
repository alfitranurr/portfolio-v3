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
        created_at: new Date().toISOString(),
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
    const isEdit = !!projectData.id
    
    const dbPayload = {
      title: projectData.title,
      description: projectData.description,
      content: projectData.content,
      category: projectData.category,
      sub_category: projectData.sub_category,
      cover_image: projectData.cover_image,
      github_url: projectData.github_url,
      demo_url: projectData.demo_url,
      notebook_url: projectData.notebook_url,
      embed_code: projectData.embed_code,
      is_featured: projectData.is_featured,
      pinned_order: parseInt(projectData.pinned_order) || 0,
      updated_at: new Date().toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('projects')
        .update(dbPayload)
        .eq('id', projectData.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('projects')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
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
    const isEdit = !!eduData.id

    const dbPayload = {
      institution: eduData.institution,
      degree: eduData.degree,
      field_of_study: eduData.field_of_study,
      location: eduData.location,
      start_date: eduData.start_date,
      end_date: eduData.end_date || null,
      gpa: eduData.gpa ? parseFloat(eduData.gpa) : null,
      description: eduData.description,
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
    const isEdit = !!expData.id

    const dbPayload = {
      role: expData.role,
      company: expData.company,
      location: expData.location,
      start_date: expData.start_date,
      end_date: expData.end_date || null,
      description: Array.isArray(expData.description) ? expData.description : expData.description.split('\n').filter(Boolean),
      is_current: expData.is_current,
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
    const isEdit = !!certData.id

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
