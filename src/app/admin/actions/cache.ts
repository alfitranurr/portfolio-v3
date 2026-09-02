'use server'

import { revalidatePath } from 'next/cache'
import { hasSupabaseConfig, requireAdmin } from './_shared'

/**
 * Revalidate all ISR-cached public pages so they reflect the latest database
 * state immediately (instead of waiting up to `revalidate = 3600` seconds).
 *
 * In mock mode (no Supabase config) the action still works — it simply bypasses
 * the admin auth gate since there is no real session to verify. In Supabase mode
 * it requires an authenticated admin; otherwise it returns unauthorized.
 */
export async function revalidatePublicPagesAction() {
  if (hasSupabaseConfig()) {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }
  }

  try {
    const publicPaths = [
      '/',
      '/projects',
      '/projects/[id]',
      '/certificates',
      '/education',
      '/experience',
    ]

    for (const p of publicPaths) {
      revalidatePath(p, 'page')
    }

    return {
      success: true,
      message: `Revalidated ${publicPaths.length} public page(s). Visitor view now shows fresh data.`,
    }
  } catch (err) {
    console.error('revalidatePublicPagesAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
