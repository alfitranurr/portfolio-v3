'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard,
  UserCog, 
  GraduationCap, 
  Briefcase, 
  Coffee, 
  Award, 
  LogOut,
  Menu, 
  X,
  ExternalLink,
  Terminal,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/app/login/actions'
import { useTheme } from 'next-themes'

function subscribeAdminSidebarStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('sidebar_toggle', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('sidebar_toggle', callback)
  }
}

function getAdminSidebarCollapsedSnapshot() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('sidebar_collapsed') === 'true'
}

function getAdminSidebarCollapsedServerSnapshot() {
  return false
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isCollapsedStored = React.useSyncExternalStore(
    subscribeAdminSidebarStorage,
    getAdminSidebarCollapsedSnapshot,
    getAdminSidebarCollapsedServerSnapshot
  )
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // On mobile, sidebar drawer should always be expanded
  const isCollapsed = isMobile ? false : isCollapsedStored

  const toggleCollapse = () => {
    const nextState = !isCollapsedStored
    localStorage.setItem('sidebar_collapsed', String(nextState))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('sidebar_toggle'))
  }

  // Only show on admin pages
  if (!pathname.startsWith('/admin')) {
    return null
  }

  const categories = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Profile Editor', href: '/admin/profile', icon: UserCog, exact: false },
        { name: 'Moment Recap', href: '/admin/photos', icon: ImageIcon, exact: false },
      ]
    },
    {
      title: 'Portfolio Content',
      items: [
        { name: 'Education', href: '/admin/education', icon: GraduationCap, exact: false },
        { name: 'Experience', href: '/admin/experience', icon: Briefcase, exact: false },
        { name: 'Projects', href: '/admin/projects', icon: Coffee, exact: false },
        { name: 'Certificates', href: '/admin/certificates', icon: Award, exact: false },
        { name: 'Tech Stack', href: '/admin/skills', icon: Terminal, exact: false },
      ]
    }
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

  const renderThemeButton = () => {
    if (!mounted) {
      return (
        <div className="w-full h-9 rounded-xl bg-slate-200/10 dark:bg-slate-800/10 animate-pulse" />
      )
    }

    const isDark = theme === 'dark'
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isCollapsed ? (isDark ? 'Light Theme' : 'Dark Theme') : undefined}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-0.5 border border-transparent transition-all cursor-pointer group",
          isCollapsed && "lg:justify-center lg:px-0"
        )}
      >
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <Moon className="w-4 h-4 text-sky-400 transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 group-hover:scale-110" />
          )}
          <span className={cn(isCollapsed && "lg:hidden")}>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
        </div>

        {/* Animated Toggle Switch */}
        <div 
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out shadow-inner",
            isDark ? "bg-primary" : "bg-slate-300 dark:bg-slate-700",
            isCollapsed && "lg:hidden"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-flex h-4.5 w-4.5 items-center justify-center transform rounded-full bg-white shadow-md transition duration-200 ease-in-out text-[9px]",
              isDark ? "translate-x-4" : "translate-x-0"
            )}
          >
            {isDark ? (
              <Moon className="w-2.5 h-2.5 text-slate-900" />
            ) : (
              <Sun className="w-2.5 h-2.5 text-amber-500" />
            )}
          </span>
        </div>
      </button>
    )
  }

  return (
    <>
      {/* Mobile Admin Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-40 px-4 flex items-center justify-between glass-panel border-b border-slate-300 dark:border-slate-800/20">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-foreground">
          <Terminal className="text-primary w-5 h-5 animate-pulse" />
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
          "admin-sidebar fixed top-0 bottom-0 left-0 z-50 glass-panel border-r border-slate-300 dark:border-slate-800/20 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:sticky lg:top-4 lg:left-auto lg:bottom-auto lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:z-30 lg:translate-x-0 lg:self-start lg:border lg:border-slate-300 dark:lg:border-slate-800/20",
          isCollapsed ? "w-52 lg:w-20 p-2 lg:p-3" : "w-52 p-3.5"
        )}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            {/* Logo Section */}
            <div className="flex items-center justify-between relative">
              <Link href="/admin" className={cn(
                "flex items-center gap-3 font-bold text-base text-foreground",
                isCollapsed && "lg:justify-center lg:gap-0"
              )}>
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                  <Terminal className="text-primary w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className={cn("flex flex-col", isCollapsed && "lg:hidden")}>
                  <span className="leading-none font-extrabold tracking-wider text-xs text-foreground">Admin Console</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-normal">Command Center</span>
                </div>
              </Link>
              {/* Desktop Collapse Toggle Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center rounded-xl glass-card text-muted-foreground hover:text-foreground hover:scale-105 hover:border-primary/30 transition-all cursor-pointer z-10 shrink-0"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4.5 h-4.5 text-primary" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
              {/* Mobile close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-foreground cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Categories */}
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.title} className="space-y-1.5">
                  <h3 className={cn(
                    "text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-widest px-3.5",
                    isCollapsed && "lg:hidden"
                  )}>
                    {category.title}
                  </h3>
                  <nav className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon
                      const isActive = item.exact 
                        ? pathname === item.href 
                        : pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          title={isCollapsed ? item.name : undefined}
                          className={cn(
                            "flex items-center justify-between px-2.5 py-2 rounded-xl transition-all duration-200 text-xs font-semibold group border",
                            isCollapsed && "lg:justify-center lg:px-0",
                            isActive 
                              ? "bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5 scale-[1.01]" 
                              : "text-muted-foreground border-transparent hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-0.5"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={cn(
                              "w-4 h-4 transition-transform duration-200 group-hover:scale-105", 
                              isActive ? "text-primary scale-105" : "text-muted-foreground group-hover:text-foreground/80"
                            )} />
                            <span className={cn(isCollapsed && "lg:hidden")}>{item.name}</span>
                          </div>
                          {isActive && !isCollapsed && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-4 border-t border-slate-300/80 dark:border-slate-800/20 space-y-3">
            <div className="space-y-1">
              {/* Theme Selector */}
              {renderThemeButton()}

              {/* View Website Link */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title={isCollapsed ? 'Live Portfolio' : undefined}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-0.5 border border-transparent transition-all group",
                  isCollapsed && "lg:justify-center lg:px-0"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-muted-foreground group-hover:text-foreground/80 transition-transform duration-200 group-hover:scale-110" />
                  <span className={cn(isCollapsed && "lg:hidden")}>Live Portfolio</span>
                </div>
                <ExternalLink className={cn("w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors", isCollapsed && "lg:hidden")} />
              </a>

              {/* Sign Out Trigger */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                title={isCollapsed ? (isSigningOut ? 'Signing out...' : 'Sign Out') : undefined}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition-all cursor-pointer border border-transparent",
                  isCollapsed && "lg:justify-center lg:px-0"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className={cn(isCollapsed && "lg:hidden")}>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </div>
              </button>
            </div>

            {/* Footer Metadata */}
            <div className={cn(
              "text-center text-[10px] text-muted-foreground/50 font-normal",
              isCollapsed && "lg:hidden"
            )}>
              <span>© 2026 Al Fitra Nur Ramadhani</span>
            </div>
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
