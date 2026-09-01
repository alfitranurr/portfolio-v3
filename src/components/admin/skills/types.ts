export interface Skill {
  id: string
  name: string
  category: string
  level: number
  desc: string
  svg_path: string | null
  logo_url?: string | null
  proficiency?: number | null
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface SkillsCrudProps {
  initialSkills: Skill[]
}

export const CATEGORY_MAP: Record<string, string> = {
  All: 'All Skills',
  technical: 'Technical Skills',
  soft: 'Soft Skills',
  tool: 'Tools & Software'
}

export const DEFAULT_SKILL: Omit<Skill, 'id'> = {
  name: '',
  category: 'technical',
  level: 0,
  desc: '',
  svg_path: '',
  logo_url: '',
  proficiency: null,
  description: ''
}

export type ViewMode = 'table' | 'grid'
export type SortField = 'newest' | 'oldest' | 'name' | 'proficiency'
