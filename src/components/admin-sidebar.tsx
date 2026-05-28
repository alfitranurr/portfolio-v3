'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  MessageSquare,
  UserCog, 
  GraduationCap, 
  Briefcase, 
  Coffee, 
  Award, 
  LogOut,
  Menu, 
  X,
  ExternalLink,
  ShieldAlert,
  Terminal,
  ChevronRight,
  Moon,
  Sun,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/app/login/actions'
import { useTheme } from 'next-themes'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { name: 'Messages & Inbox', href: '/admin', icon: MessageSquare, exact: true },
    { name: 'Profile Editor', href: '/admin/profile', icon: UserCog, exact: false },
    { name: 'Manage Projects', href: '/admin/projects', icon: Coffee, exact: false },
    { name: 'Manage Tech Stack', href: '/admin/skills', icon: Terminal, exact: false },
    { name: 'Manage Education', href: '/admin/education', icon: GraduationCap, exact: false },
    { name: 'Manage Experience', href: '/admin/experience', icon: Briefcase, exact: false },
    { name: 'Manage Certificates', href: '/admin/certificates', icon: Award, exact: false },
  ]

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out of the Admin panel?')) {
      setIsSigningOut(true)
      try {
        await signOutAction()
        router.push('/')
        router.refresh()
      } catch (err) {
        console.error('Sign out failed:', err)
      } finally {
        setIsSigningOut(false)
      }
    }
  }

  return (
    <>
      {/* Mobile Admin Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-40 px-4 flex items-center justify-between glass-panel border-b border-slate-200/20 dark:border-slate-800/10">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-foreground">
          <ShieldAlert className="text-primary w-5 h-5 animate-pulse" />
          <span className="font-extrabold tracking-tight">Admin Portal</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl glass-card text-foreground cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-200/20 dark:border-slate-800/10 p-5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 overflow-y-auto scrollbar-hide",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:top-4 lg:bottom-4 lg:left-4 lg:rounded-3xl lg:h-[calc(100vh-2rem)]"
        )}
      >
        <div>
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-5 relative">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-base text-foreground">
              <ShieldAlert className="text-primary w-5 h-5 animate-pulse" />
              <div className="flex flex-col">
                <span className="leading-tight font-black tracking-wider text-xs text-primary">ADMIN CONSOLE</span>
                <span className="text-[9px] text-muted-foreground font-normal">Command Center</span>
              </div>
            </Link>
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-foreground cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2 rounded-xl transition-all duration-200 text-xs font-semibold",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10 scale-[1.01]" 
                      : "text-foreground/75 hover:bg-white/10 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-0.5"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-foreground" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4">
          {/* Theming Section */}
          <div className="pt-3 border-t border-slate-200/20 dark:border-slate-800/10 space-y-2 px-3.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/60 block">Theming</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                {!mounted ? (
                  <div className="w-4 h-4 rounded-md bg-slate-200/30 dark:bg-slate-800/30 animate-pulse" />
                ) : theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-sky-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-xs font-semibold">Dark Mode</span>
              </div>
              
              {!mounted ? (
                <div className="w-10 h-5.5 rounded-full bg-slate-200/30 dark:bg-slate-800/30 animate-pulse" />
              ) : (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    theme === 'dark' ? "bg-white" : "bg-slate-300 dark:bg-slate-700"
                  )}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                      theme === 'dark' ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                    )}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="pt-3 border-t border-slate-200/20 dark:border-slate-800/10 space-y-2">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/60 block px-3.5">Console Actions</span>
            <div className="space-y-1">
              {/* View Website Link */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-dashed border-slate-200/20 dark:border-slate-800/20 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/45 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>Live Portfolio</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
              </a>

              {/* Sign Out Trigger */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-slate-200/20 dark:border-slate-800/20 pt-3 text-center text-[10px] text-muted-foreground/80">
            <span>© 2026 Admin Panel</span>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay Background */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
        />
      )}
    </>
  )
}
