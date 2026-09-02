'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { hasSupabaseConfig, requireAdmin } from './_shared'

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
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized admin user' }
    }
    const { supabase, user } = admin

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
