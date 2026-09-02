'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Skill } from '@/lib/types'
import { hasSupabaseConfig, requireAdmin } from './_shared'

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
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }
    const { supabase } = admin

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
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }
    const { supabase } = admin
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
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized admin user' }
    }
    const { supabase, user } = admin

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
