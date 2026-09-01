export interface Message {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean | null
  created_at: string
}

export interface MessagesListProps {
  initialMessages: Message[]
  stats: {
    projects: number
    education: number
    experience: number
    certificates: number
  }
  visitorStats?: {
    totalViews: number
    uniqueVisitors: number
    todayViews: number
    todayUnique: number
    isMissingTable?: boolean
  }
}

export interface VisitorStatsProps {
  visitorStats: {
    totalViews: number
    uniqueVisitors: number
    todayViews: number
    todayUnique: number
    isMissingTable?: boolean
  } | null
}
