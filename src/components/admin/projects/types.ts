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
  is_featured: boolean | null
  is_on_progress?: boolean | null
  pinned_order?: number | null
  featured_order?: number | null
  created_at?: string
  updated_at?: string
}

export interface ProjectsCrudProps {
  initialProjects: Project[]
}

export const DATA_SUBCATEGORIES = [
  'Data Analytics Projects',
  'Data Visualization Projects',
  'Artificial Intelligence Projects',
  'Automation Projects',
  'Data Modeling and Simulation Projects',
]

export const NON_DATA_SUBCATEGORIES = [
  'Web Development Projects',
  'Mobile Development Projects',
  'Digital Marketing Projects',
  'Graphic Design Projects',
]

export const SUBCATEGORY_MAP: Record<string, string> = {
  'All': 'All Subcategories',
  'Data Analytics Projects': 'Data Analytics',
  'Data Visualization Projects': 'Data Visualization',
  'Artificial Intelligence Projects': 'Artificial Intelligence',
  'Data Automation Projects': 'Automation',
  'Automation Projects': 'Automation',
  'Data Modeling and Simulation Projects': 'Data Modeling & Simulation',
  'Web Development Projects': 'Web Development',
  'Mobile Development Projects': 'Mobile Development',
  'Digital Marketing Projects': 'Digital Marketing',
  'Graphic Design Projects': 'Graphic Design',
}

export const DEFAULT_PROJECT: Omit<Project, 'id'> = {
  title: '',
  description: '',
  content: '',
  category: 'data',
  sub_category: 'Data Analytics Projects',
  cover_image: '',
  github_url: '',
  demo_url: '',
  notebook_url: '',
  slide_url: '',
  embed_code: '',
  is_featured: false,
  is_on_progress: false,
  pinned_order: 0,
  featured_order: 0,
  created_at: new Date().toLocaleDateString('en-CA')
}
