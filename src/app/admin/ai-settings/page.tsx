import * as React from 'react'
import { getAISettingsAction, getAIChatLogsAction } from '@/app/admin/actions'
import { AISettingsClient } from '@/components/admin/ai-settings-client'

export const dynamic = 'force-dynamic'

export default async function AISettingsPage() {
  // Fetch settings and logs concurrently on the server
  const [settings, logs] = await Promise.all([
    getAISettingsAction(),
    getAIChatLogsAction()
  ])

  return (
    <div className="w-full">
      <AISettingsClient initialSettings={settings} initialLogs={logs} />
    </div>
  )
}
