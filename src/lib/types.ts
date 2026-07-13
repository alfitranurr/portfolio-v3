export interface Profile {
  id: string
  name: string
  headline: string
  about_me: string | null
  avatar_url: string | null
  resume_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  github_url: string | null
  skills_title?: string | null
  skills_subtitle?: string | null
  logo_url?: string | null
}

export interface Project {
  id: string
  title: string
  description: string
  content: string | null
  category: 'data' | 'non-data'
  sub_category: string
  cover_image: string | null
  github_url: string | null
  demo_url: string | null
  notebook_url: string | null
  slide_url?: string | null
  embed_code: string | null
  is_featured: boolean
  is_on_progress?: boolean | null
  pinned_order: number
  featured_order?: number
  created_at: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field_of_study: string | null
  location: string | null
  start_date: string
  end_date: string | null
  gpa: number | string | null
  description: string | null
  logo_url?: string | null
}

export interface Experience {
  id: string
  role: string
  company: string
  location: string | null
  start_date: string
  end_date: string | null
  description: string[]
  is_current: boolean
  category?: 'professional' | 'committee_organization'
  logo_url?: string | null
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  issue_date: string
  credential_url: string | null
  credential_id: string | null
  category: 'competition' | 'seminar_workshop' | 'license_certification' | 'committee_organization'
  image_url?: string | null
}

export interface Message {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: number
  desc: string
  svg_path: string | null
  logo_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface Photo {
  id: string
  title: string | null
  year: string | null
  description: string | null
  image_url: string
  created_at?: string
  updated_at?: string
}

