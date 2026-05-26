'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  MessageSquare,
  UserCog, 
  GraduationCap, 
  Briefcase, 
  FolderCode, 
  Award, 
  LogOut,
  Menu, 
  X,
  ExternalLink,
  ShieldAlert,
  Terminal
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/app/login/actions'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  const navItems = [
    { name: 'Messages & Inbox', href: '/admin', icon: MessageSquare, exact: true },
    { name: 'Profile Editor', href: '/admin/profile', icon: UserCog, exact: false },
    { name: 'Manage Projects', href: '/admin/projects', icon: FolderCode, exact: false },
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
          <ThemeToggle />
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
          "fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel border-r border-slate-200/20 dark:border-slate-800/10 p-6 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:top-4 lg:bottom-4 lg:left-4 lg:rounded-3xl lg:h-[calc(100vh-2rem)]"
        )}
      >
        <div>
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-foreground">
              <ShieldAlert className="text-primary w-6 h-6 animate-pulse" />
              <div className="flex flex-col">
                <span className="leading-tight font-black tracking-wider text-primary">ADMIN CONSOLE</span>
                <span className="text-[10px] text-muted-foreground font-normal">Command Center</span>
              </div>
            </Link>
            {/* Theme Toggle (Desktop Only) */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
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
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "text-foreground/75 hover:bg-white/20 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4">
          {/* View Website Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-slate-200/20 dark:border-slate-800/20 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/45 transition-all"
          >
            <span>View Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
          </a>

          {/* Sign Out Trigger */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
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
