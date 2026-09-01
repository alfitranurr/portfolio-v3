import * as React from 'react'
import { MessagesList } from '@/components/admin/messages'
import { getMessagesAction } from '@/app/admin/actions'
import { getProjects, getEducation, getExperience, getCertificates, getVisitorStats } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Fetch messages and stats concurrently
  const [messages, projects, education, experience, certificates, visitorStats] = await Promise.all([
    getMessagesAction(),
    getProjects(),
    getEducation(),
    getExperience(),
    getCertificates(),
    getVisitorStats(),
  ])

  const stats = {
    projects: projects.length,
    education: education.length,
    experience: experience.length,
    certificates: certificates.length,
  }

  return (
    <div className="w-full">
      <MessagesList initialMessages={messages} stats={stats} visitorStats={visitorStats} />
    </div>
  )
}
