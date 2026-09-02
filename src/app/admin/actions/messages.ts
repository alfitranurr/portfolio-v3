'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Message } from '@/lib/types'
import { hasSupabaseConfig, requireAdmin } from './_shared'

function getMockMessages(cookieStore: Awaited<ReturnType<typeof cookies>>): Message[] {
  const mockMessages = cookieStore.get('mock_messages')?.value
  if (!mockMessages) {
    return [
      {
        id: "mock-msg-1",
        name: "John Doe",
        email: "johndoe@example.com",
        subject: "Inquiry about Machine Learning Consulting",
        message: "Hi Al Fitra, I saw your predictive customer churn project and I am interested in collaborating on a similar pipeline for our e-commerce business. Do you have availability next month?",
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "mock-msg-2",
        name: "Jane Smith",
        email: "janesmith@techcorp.com",
        subject: "Job Opportunity: Senior Data Scientist",
        message: "Hello! We are looking for a remote data science consultant to join our telemetry modeling team. Your portfolio is outstanding. Let's schedule a call.",
        is_read: true,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ]
  }
  return JSON.parse(mockMessages)
}

export async function getMessagesAction() {
  if (!hasSupabaseConfig()) {
    const cookieStore = await cookies()
    return getMockMessages(cookieStore)
  }

  try {
    const admin = await requireAdmin()
    if (!admin) {
      throw new Error('Unauthorized')
    }
    const { supabase } = admin
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('getMessagesAction error:', err)
    return []
  }
}

export async function toggleMessageReadAction(id: string, isRead: boolean) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const list = getMockMessages(cookieStore)
    const updated = list.map((m: Message) => m.id === id ? { ...m, is_read: isRead } : m)
    cookieStore.set('mock_messages', JSON.stringify(updated), { path: '/' })
    revalidatePath('/admin')
    return { success: true }
  }

  try {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }
    const { supabase } = admin
    const { error } = await supabase
      .from('messages')
      .update({ is_read: isRead })
      .eq('id', id)
    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('toggleMessageReadAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteMessageAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const list = getMockMessages(cookieStore)
    const updated = list.filter((m: Message) => m.id !== id)
    cookieStore.set('mock_messages', JSON.stringify(updated), { path: '/' })
    revalidatePath('/admin')
    return { success: true }
  }

  try {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }
    const { supabase } = admin
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('deleteMessageAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
