'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-200/30 dark:bg-slate-800/30 border border-slate-300/20 dark:border-slate-700/20 animate-pulse" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 glass-card text-foreground/80 hover:text-foreground hover:scale-105 active:scale-95 cursor-pointer"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-all text-sky-400" />
      ) : (
        <Moon className="w-5 h-5 transition-all text-slate-700" />
      )}
    </button>
  )
}
