export interface Experience {
  id: string
  role: string
  company: string
  location: string | null
  start_date: string
  end_date: string | null
  description: string[]
  is_current: boolean | null
  category?: 'professional' | 'committee_organization'
  logo_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface ExperienceCrudProps {
  initialExperience: Experience[]
}

export const CATEGORIES = ['All', 'professional', 'committee_organization']

export const CATEGORY_MAP: Record<string, string> = {
  All: 'All Experiences',
  professional: 'Professional Experience',
  committee_organization: 'Committee & Organization'
}

export const DEFAULT_EXPERIENCE: Omit<Experience, 'id'> = {
  role: '',
  company: '',
  location: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  description: [],
  is_current: false,
  category: 'professional',
  logo_url: ''
}

export type ViewMode = 'table' | 'grid'
export type SortField = 'newest' | 'oldest' | 'company' | 'role'
