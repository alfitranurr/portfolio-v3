'use server'

import { createClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from './_shared'

export async function trackPageViewAction(pagePath: string, visitorId: string) {
  if (!hasSupabaseConfig()) {
    return { success: true, message: 'Mock track successful.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('page_views')
      .insert([{
        visitor_id: visitorId,
        page_path: pagePath,
        created_at: new Date().toISOString()
      }])
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, fail silently
        return { success: false, code: '42P01' }
      }
      throw error
    }
    return { success: true }
  } catch (err) {
    console.error('trackPageViewAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function getVisitorStatsAction() {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return { success: false, error: 'Unauthorized' }
      }
    } catch {
      return { success: false, error: 'Unauthorized' }
    }
  }

  try {
    const { getVisitorStats } = await import('@/lib/data-service')
    const stats = await getVisitorStats()
    return { success: true, data: stats }
  } catch (err) {
    console.error('getVisitorStatsAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function resetVisitorAnalyticsAction() {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        return { success: false, error: 'Unauthorized' }
      }

      // 1. Try database RPC reset function first (bypasses RLS issues)
      const { error: rpcErr } = await supabase.rpc('reset_visitor_analytics')

      if (!rpcErr) {
        return { success: true }
      }

      // 2. Fallback to direct DELETE query
      const { error } = await supabase
        .from('page_views')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        if (error.code === '42P01') {
          return { success: true, message: 'Table does not exist yet' }
        }
        throw error
      }
      return { success: true }
    } catch (err) {
      console.error('resetVisitorAnalyticsAction error:', err)
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return { success: true }
}

export async function getMonthlyVisitorStatsAction(year: number) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return { success: false, error: 'Unauthorized' }
      }
    } catch {
      return { success: false, error: 'Unauthorized' }
    }
  }

  try {
    const { getMonthlyVisitorStats } = await import('@/lib/data-service')
    const stats = await getMonthlyVisitorStats(year)
    return { success: true, data: stats }
  } catch (err) {
    console.error('getMonthlyVisitorStatsAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function getAvailableYearsAction() {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return { success: false, error: 'Unauthorized' }
      }
    } catch {
      return { success: false, error: 'Unauthorized' }
    }
  }

  try {
    const { getAvailableYears } = await import('@/lib/data-service')
    const years = await getAvailableYears()
    return { success: true, data: years }
  } catch (err) {
    console.error('getAvailableYearsAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
