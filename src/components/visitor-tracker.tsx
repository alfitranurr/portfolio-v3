// cspell:ignore subpages yxxx
'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { trackPageViewAction } from '@/app/admin/actions'

const VISITOR_COOKIE_NAME = 'portfolio_visitor_id'
const VISITOR_STORAGE_KEY = 'portfolio_visitor_id'
const SESSION_TRACKED_KEY = 'portfolio_session_tracked'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return matches ? decodeURIComponent(matches[1]) : null
}

function setCookie(name: string, value: string, days = 3650) {
  if (typeof document === 'undefined') return
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

function getOrCreateVisitorId(): string {
  let visitorId: string | null = null

  // 1. Check localStorage first
  try {
    visitorId = localStorage.getItem(VISITOR_STORAGE_KEY)
  } catch {}

  // 2. Fallback to cookie if localStorage didn't have it
  if (!visitorId) {
    visitorId = getCookie(VISITOR_COOKIE_NAME)
  }

  // 3. Generate a brand new UUID if no visitor ID exists
  if (!visitorId || visitorId.length < 20) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      visitorId = crypto.randomUUID()
    } else {
      visitorId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }

  // Dual persist to both localStorage and Cookie to guarantee ID is never lost for the browser
  try {
    localStorage.setItem(VISITOR_STORAGE_KEY, visitorId)
  } catch {}
  setCookie(VISITOR_COOKIE_NAME, visitorId)

  return visitorId
}

export function VisitorTracker() {
  const pathname = usePathname()

  React.useEffect(() => {
    // Do not track admin, login or api routes
    if (
      !pathname ||
      pathname.startsWith('/admin') || 
      pathname.startsWith('/login') || 
      pathname.startsWith('/api')
    ) {
      return
    }

    // 1 View per Web Session / Opening:
    // Check if current browser tab/session has already recorded a view.
    // Navigating between subpages in the same session will NOT trigger additional views.
    try {
      if (sessionStorage.getItem(SESSION_TRACKED_KEY) === 'true') {
        return
      }
    } catch {}

    const visitorId = getOrCreateVisitorId()

    // Mark current session as tracked
    try {
      sessionStorage.setItem(SESSION_TRACKED_KEY, 'true')
    } catch {}

    // Track web visit (Total Views +1 for session, Unique Visitors +1 ONLY if brand new browser)
    trackPageViewAction(pathname, visitorId).catch(err => {
      console.warn('Analytics tracking error:', err)
    })
  }, [pathname])

  return null
}
