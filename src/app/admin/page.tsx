import * as React from 'react'
import { MessagesList } from '@/components/admin/messages'
import { getMessagesAction } from '@/app/admin/actions'
import { getCounts, getVisitorStats } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Fetch messages and stats concurrently
  const [messages, stats, visitorStats] = await Promise.all([
    getMessagesAction(),
    getCounts(),
    getVisitorStats(),
  ])

  return (
    <div className="w-full">
      <MessagesList initialMessages={messages} stats={stats} visitorStats={visitorStats} />
    </div>
  )
}
