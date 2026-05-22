'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitContactForm(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  if (!name || !email || !message) {
    return { success: false, error: 'Please fill in all required fields (Name, Email, Message).' }
  }

  const hasConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (!hasConfig) {
    console.log('No Supabase credentials. Mocked form submission:', { name, email, subject, message })
    return { success: true, message: 'Message sent successfully (Development Mode Mock).' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('messages')
      .insert([{ name, email, subject, message }])

    if (error) {
      console.error('Contact form insertion failed:', error.message)
      return { success: false, error: 'Failed to write message to database. Please check table permissions.' }
    }

    return { success: true, message: 'Thank you! Your message has been sent successfully.' }
  } catch (err: any) {
    console.error('Contact form network error:', err)
    return { success: false, error: 'Network error occurred. Please try again later.' }
  }
}
