'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { trackPageViewAction } from '@/app/admin/actions'

export function VisitorTracker() {
  const pathname = usePathname()

  React.useEffect(() => {
    // Do not track admin, login or api routes
    if (
      pathname.startsWith('/admin') || 
      pathname.startsWith('/login') || 
      pathname.startsWith('/api')
    ) {
      return
    }

    // Retrieve or generate visitor ID
    let visitorId = localStorage.getItem('portfolio_visitor_id')
    if (!visitorId) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        visitorId = crypto.randomUUID()
      } else {
        // Fallback for older browsers
        visitorId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }
      localStorage.setItem('portfolio_visitor_id', visitorId)
    }

    // Call server action to track
    trackPageViewAction(pathname, visitorId).catch(err => {
      console.warn('Analytics tracking error:', err)
    })
  }, [pathname])

  return null
}
