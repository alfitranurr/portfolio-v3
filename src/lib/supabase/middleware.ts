import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const hasConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Mock cookie only grants access in mock mode (no Supabase configured).
  // In production, ignore it entirely — Supabase session is the sole authority.
  const mockLoggedIn = !hasConfig && request.cookies.get('mock_logged_in')?.value === 'true'

  let user = null
  if (hasConfig) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch (err) {
      console.warn('Middleware auth session refresh error:', err)
    }
  }

  const isAuthenticated = !!user || mockLoggedIn

  // Protect admin paths
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      // Redirect to login page
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in and tries to access /login, redirect to /admin
  if (request.nextUrl.pathname.startsWith('/login') && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
