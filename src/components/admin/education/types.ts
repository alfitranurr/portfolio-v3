export interface Education {
  id: string
  institution: string
  degree: string
  field_of_study: string | null
  location: string | null
  start_date: string
  end_date: string | null
  gpa: string | number | null
  description: string | null
  logo_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface EducationCrudProps {
  initialEducation: Education[]
}

export const DEFAULT_EDUCATION: Omit<Education, 'id'> = {
  institution: '',
  degree: '',
  field_of_study: '',
  location: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  gpa: null,
  description: '',
  logo_url: ''
}

export type ViewMode = 'table' | 'grid'
export type SortField = 'newest' | 'oldest' | 'institution' | 'degree'
