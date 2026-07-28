'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

function subscribeSidebarStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('sidebar_toggle', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('sidebar_toggle', callback)
  }
}

function getSidebarCollapsedSnapshot() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('sidebar_collapsed') === 'true'
}

function getSidebarCollapsedServerSnapshot() {
  return false
}

export function MainLayoutContainer({ children }: { children: React.ReactNode }) {
  const isCollapsed = React.useSyncExternalStore(
    subscribeSidebarStorage,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot
  )

  return (
    <div
      className={cn(
        "flex-1 w-full mx-auto px-4 md:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-6 min-h-screen transition-[max-width] duration-300 ease-in-out",
        isCollapsed ? "max-w-full" : "max-w-7xl"
      )}
    >
      {children}
    </div>
  )
}
