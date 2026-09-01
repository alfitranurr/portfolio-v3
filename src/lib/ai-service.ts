import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as fs from 'fs/promises'
import * as path from 'path'

export interface AISettings {
  model_name: string
  search_grounding: boolean
  temperature: number
  max_history: number
}

export interface AIChatLog {
  id: string
  prompt_preview: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  model_name: string
  search_grounding: boolean
  user_ip: string
  created_at: string
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  model_name: 'gemini-2.5-flash',
  search_grounding: true,
  temperature: 0.7,
  max_history: 10
}

function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Fallback path in temp directory or local workspace
const MOCK_LOGS_DIR = path.join(process.cwd(), 'src', 'lib')
const MOCK_LOGS_FILE = path.join(MOCK_LOGS_DIR, 'mock-ai-logs.json')

// In-memory fallback if file system operations fail (e.g. in read-only environment)
let inMemoryLogs: AIChatLog[] = []

export async function getAISettings(): Promise<AISettings> {
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockSettings = cookieStore.get('mock_ai_settings')?.value
      if (mockSettings) {
        return JSON.parse(mockSettings)
      }
    } catch (e: unknown) {
      console.warn('Failed to parse mock settings from cookies', e)
    }
    return DEFAULT_AI_SETTINGS
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return DEFAULT_AI_SETTINGS
    }
    return {
      model_name: data.model_name || DEFAULT_AI_SETTINGS.model_name,
      search_grounding: data.search_grounding !== undefined ? data.search_grounding : DEFAULT_AI_SETTINGS.search_grounding,
      temperature: data.temperature !== undefined ? Number(data.temperature) : DEFAULT_AI_SETTINGS.temperature,
      max_history: data.max_history !== undefined ? Number(data.max_history) : DEFAULT_AI_SETTINGS.max_history
    }
  } catch (err) {
    console.warn('AI Settings connection error, using fallback default:', err)
    return DEFAULT_AI_SETTINGS
  }
}

export async function saveAISettings(settings: AISettings): Promise<{ success: boolean; error?: string }> {
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      cookieStore.set('mock_ai_settings', JSON.stringify(settings), { path: '/' })
      return { success: true }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  }

  try {
    const supabase = await createClient()

    // Check if a settings row already exists
    const { data: existing, error: fetchError } = await supabase
      .from('ai_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (fetchError) throw fetchError

    let error
    if (existing) {
      const { error: updateError } = await supabase
        .from('ai_settings')
        .update({
          model_name: settings.model_name,
          search_grounding: settings.search_grounding,
          temperature: settings.temperature,
          max_history: settings.max_history,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('ai_settings')
        .insert([{
          model_name: settings.model_name,
          search_grounding: settings.search_grounding,
          temperature: settings.temperature,
          max_history: settings.max_history,
          updated_at: new Date().toISOString()
        }])
      error = insertError
    }

    if (error) throw error
    return { success: true }
  } catch (err: unknown) {
    console.error('saveAISettings error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function getAIChatLogs(): Promise<AIChatLog[]> {
  if (!hasSupabaseConfig()) {
    try {
      const content = await fs.readFile(MOCK_LOGS_FILE, 'utf-8')
      const logs: AIChatLog[] = JSON.parse(content)
      inMemoryLogs = logs // Sync memory
      return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch {
      // Fallback to in-memory logs
      return [...inMemoryLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_chat_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('getAIChatLogs error:', err)
    return []
  }
}

export async function logAIChat(logEntry: Omit<AIChatLog, 'id' | 'created_at'>): Promise<void> {
  const newLog: AIChatLog = {
    ...logEntry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  }

  if (!hasSupabaseConfig()) {
    try {
      let logs: AIChatLog[] = []
      try {
        const content = await fs.readFile(MOCK_LOGS_FILE, 'utf-8')
        logs = JSON.parse(content)
      } catch {
        logs = [...inMemoryLogs]
      }

      logs.push(newLog)
      // Keep only last 100 logs to prevent memory/file bloat
      if (logs.length > 100) {
        logs = logs.slice(-100)
      }

      inMemoryLogs = logs // Update memory
      
      try {
        await fs.mkdir(MOCK_LOGS_DIR, { recursive: true })
        await fs.writeFile(MOCK_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8')
      } catch (writeErr) {
        // Read-only filesystem, memory backup is already updated
        console.warn('Could not write mock logs to disk (filesystem read-only). Kept in memory.', writeErr)
      }
    } catch (e) {
      console.error('Failed to log AI chat in mock mode:', e)
    }
    return
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_chat_logs')
      .insert([newLog])

    if (error) throw error
  } catch (err) {
    console.error('logAIChat error:', err)
  }
}

export async function clearAIChatLogs(): Promise<{ success: boolean; error?: string }> {
  if (!hasSupabaseConfig()) {
    try {
      inMemoryLogs = []
      try {
        await fs.writeFile(MOCK_LOGS_FILE, JSON.stringify([]), 'utf-8')
      } catch (err) {
        console.warn('Could not write empty logs file', err)
      }
      return { success: true }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_chat_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all records

    if (error) throw error
    return { success: true }
  } catch (err: unknown) {
    console.error('clearAIChatLogs error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
