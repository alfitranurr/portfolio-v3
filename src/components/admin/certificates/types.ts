export interface Certificate {
  id: string
  title: string
  issuer: string
  issue_date: string
  credential_url: string | null
  credential_id: string | null
  category: 'competition' | 'seminar_workshop' | 'license_certification' | 'committee_organization'
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface CertificatesCrudProps {
  initialCertificates: Certificate[]
}

export const CATEGORIES = ['All', 'competition', 'seminar_workshop', 'license_certification', 'committee_organization']

export const CATEGORY_MAP: Record<string, string> = {
  All: 'All Credentials',
  competition: 'Competitions',
  seminar_workshop: 'Seminars & Workshops',
  license_certification: 'Licenses & Certifications',
  committee_organization: 'Work & Organizations',
}

export const DEFAULT_CERTIFICATE: Omit<Certificate, 'id'> = {
  title: '',
  issuer: '',
  issue_date: new Date().toISOString().split('T')[0],
  credential_url: '',
  credential_id: '',
  category: 'license_certification',
  image_url: ''
}

export type ViewMode = 'table' | 'grid'
export type SortField = 'newest' | 'oldest' | 'title' | 'issuer'
