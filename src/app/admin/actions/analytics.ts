'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { hasSupabaseConfig, requireAdmin } from './_shared'

// In-memory throttle for trackPageViewAction: at most 1 insert per
// (visitor IP, page path) every THROTTLE_MS. Prevents a flood of inserts
// when a client loops or replays the action. Lost on cold-start, which is
// acceptable — the client-side sessionStorage guard already dedupes most
// legitimate per-session traffic; this is a backstop for abuse.
const PAGE_VIEW_THROTTLE_MS = 60_000
const PAGE_VIEW_THROTTLE_MAX_ENTRIES = 10_000
const pageViewThrottle = new Map<string, number>()

function shouldThrottle(key: string): boolean {
  const now = Date.now()
  const last = pageViewThrottle.get(key)
  if (last && now - last < PAGE_VIEW_THROTTLE_MS) {
    return true
  }
  pageViewThrottle.set(key, now)

  // Opportunistic cleanup so the Map cannot grow unbounded.
  if (pageViewThrottle.size > PAGE_VIEW_THROTTLE_MAX_ENTRIES) {
    for (const [k, t] of pageViewThrottle) {
      if (now - t >= PAGE_VIEW_THROTTLE_MS) pageViewThrottle.delete(k)
    }
  }
  return false
}

export async function trackPageViewAction(pagePath: string, visitorId: string) {
  if (!hasSupabaseConfig()) {
    return { success: true, message: 'Mock track successful.' }
  }

  try {
    // Per-IP rate-limit backstop. x-forwarded-for is a comma-separated chain;
    // the first entry is the originating client IP.
    const headerList = await headers()
    const forwardedFor = headerList.get('x-forwarded-for')
    const ip = (forwardedFor && forwardedFor.split(',')[0].trim()) || '127.0.0.1'
    if (shouldThrottle(`${ip}:${pagePath}`)) {
      return { success: true, message: 'Throttled.' }
    }

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
    const admin = await requireAdmin()
    if (!admin) {
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
      const admin = await requireAdmin()
      if (!admin) {
        return { success: false, error: 'Unauthorized' }
      }
      const { supabase } = admin

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
    const admin = await requireAdmin()
    if (!admin) {
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
    const admin = await requireAdmin()
    if (!admin) {
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
