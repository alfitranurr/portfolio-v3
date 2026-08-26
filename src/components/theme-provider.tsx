'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error
  console.error = (...args: unknown[]) => {
    const msg = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ')
    if (msg.includes('Encountered a script tag')) return
    orig.apply(console, args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
