'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const mockEmail = process.env.ADMIN_MOCK_EMAIL || 'admin@portfolio.local'
  const mockPassword = process.env.ADMIN_MOCK_PASSWORD || 'admin123'

  if (email === mockEmail && password === mockPassword) {
    const cookieStore = await cookies()
    cookieStore.set('mock_logged_in', 'true', { path: '/' })
    return { success: true, redirect: '/admin' }
  }

  const hasConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (!hasConfig) {
    return { 
      success: false, 
      error: 'Invalid email or password.' 
    }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, redirect: '/admin' }
  } catch {
    return { success: false, error: 'Connection error during authentication. Please retry.' }
  }
}

export async function signupAction(prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const headline = formData.get('headline') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || !name) {
    return { success: false, error: 'Name, email, and password are required.' }
  }

  const hasConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (!hasConfig) {
    return { success: false, error: 'Supabase credentials not configured. Signup is disabled.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          headline: headline || 'Data Science Professional',
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      message: 'Admin account registration submitted successfully. Please sign in or check your email verification (if SMTP is enabled).' 
    }
  } catch {
    return { success: false, error: 'Connection error during registration.' }
  }
}

export async function signOutAction() {
  const cookieStore = await cookies()
  
  // Clear mock cookie
  cookieStore.delete('mock_logged_in')
  
  // Clear Supabase session if config exists
  const hasConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  if (hasConfig) {
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error signing out of Supabase:', err)
    }
  }
  
  return { success: true }
}
