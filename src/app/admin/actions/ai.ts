'use server'

import { revalidatePath } from 'next/cache'
import {
  getAISettings,
  saveAISettings,
  getAIChatLogs,
  clearAIChatLogs,
  AISettings
} from '@/lib/ai-service'
import { hasSupabaseConfig, requireAdmin } from './_shared'

export async function getAISettingsAction() {
  if (hasSupabaseConfig()) {
    const admin = await requireAdmin()
    if (!admin) {
      return {
        model_name: 'gemini-2.5-flash',
        search_grounding: true,
        temperature: 0.7,
        max_history: 10
      }
    }
  }
  return await getAISettings()
}

export async function saveAISettingsAction(settings: AISettings) {
  if (hasSupabaseConfig()) {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }
  }
  const res = await saveAISettings(settings)
  revalidatePath('/admin/ai-settings')
  return res
}

export async function getAIChatLogsAction() {
  if (hasSupabaseConfig()) {
    const admin = await requireAdmin()
    if (!admin) {
      throw new Error('Unauthorized')
    }
  }
  return await getAIChatLogs()
}

export async function clearAIChatLogsAction() {
  if (hasSupabaseConfig()) {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }
  }
  const res = await clearAIChatLogs()
  revalidatePath('/admin/ai-settings')
  return res
}
