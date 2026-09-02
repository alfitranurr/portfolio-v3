import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Resolve the authenticated admin Supabase session.
 *
 * Returns `{ supabase, user }` when a valid session exists, or `null` when the
 * caller is unauthenticated. Callers are expected to translate `null` into the
 * domain-appropriate unauthorized response (either a `{ success: false }` payload
 * or a thrown `Error`, depending on the action's return contract).
 *
 * Only call this from the Supabase branch (i.e. after `hasSupabaseConfig()` is
 * true) — the mock branch never needs server-side auth.
 */
export async function requireAdmin(): Promise<{ supabase: SupabaseClient; user: User } | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return { supabase, user }
  } catch {
    return null
  }
}
