'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  getAISettings,
  saveAISettings,
  getAIChatLogs,
  clearAIChatLogs,
  AISettings
} from '@/lib/ai-service'
import { hasSupabaseConfig } from './_shared'

export async function getAISettingsAction() {
  return await getAISettings()
}

export async function saveAISettingsAction(settings: AISettings) {
  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
  }
  const res = await saveAISettings(settings)
  revalidatePath('/admin/ai-settings')
  return res
}

export async function getAIChatLogsAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }
  }
  return await getAIChatLogs()
}

export async function clearAIChatLogsAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
  }
  const res = await clearAIChatLogs()
  revalidatePath('/admin/ai-settings')
  return res
}
