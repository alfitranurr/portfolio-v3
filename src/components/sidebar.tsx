'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  GraduationCap, 
  Briefcase, 
  Coffee, 
  Award, 
  Mail, 
  Menu, 
  X,
  Terminal,
  MessageSquareText,
  Moon,
  Sun,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { Github, Linkedin, Instagram } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Profile } from '@/lib/types'
import { useTheme } from 'next-themes'
import { BlurImage } from '@/components/ui/blur-image'

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

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const isCollapsed = React.useSyncExternalStore(
    subscribeSidebarStorage,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot
  )
  const { theme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const toggleCollapse = () => {
    const nextState = !isCollapsed
    localStorage.setItem('sidebar_collapsed', String(nextState))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('sidebar_toggle'))
  }

  // Disable sidebar on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  const handle = profile.github_url 
    ? `@${profile.github_url.split('/').pop()}` 
    : (profile.instagram_url 
        ? `@${profile.instagram_url.split('/').pop()}` 
        : `@${profile.name.toLowerCase().replace(/\s+/g, '')}`)

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Education', href: '/education', icon: GraduationCap },
    { name: 'Experience', href: '/experience', icon: Briefcase },
    { name: 'Projects', href: '/projects', icon: Coffee },
    { name: 'Certificates', href: '/certificates', icon: Award },
    { name: 'Ask AI', href: '/ask-ai', icon: MessageSquareText },
    { name: 'Get In Touch', href: '/contact', icon: Mail },
  ]

  const socials = [
    { icon: Instagram, href: 'https://www.instagram.com/rmdhani_ii', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/al-fitra-nur-ramadhani/', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/alfitranurr', label: 'GitHub' },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-40 px-4 flex items-center justify-between glass-panel border-b border-slate-200/20 dark:border-slate-800/10">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          {profile.logo_url ? (
            <div className="w-6 h-6 relative shrink-0 overflow-hidden rounded-md">
              <BlurImage
                src={profile.logo_url}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <Terminal className="text-primary w-5 h-5" />
          )}
          <span>Al Fitra</span>
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
          "fixed top-0 bottom-0 left-0 z-50 glass-panel border-r border-slate-200/20 dark:border-slate-800/10 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:sticky lg:top-4 lg:left-auto lg:bottom-auto lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:z-30 lg:translate-x-0 lg:self-start",
          isCollapsed ? "w-64 lg:w-20 p-3" : "w-64 p-5"
        )}
      >
        <div>
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-5 relative">
            {/* Desktop Toggle Button */}
            <button
              onClick={toggleCollapse}
              className={cn(
                "hidden lg:flex items-center justify-center rounded-xl glass-card text-muted-foreground hover:text-foreground hover:scale-105 hover:border-primary/30 transition-all cursor-pointer z-10",
                isCollapsed 
                  ? "w-10 h-10 mx-auto mb-4" 
                  : "absolute top-0 right-0 w-8 h-8"
              )}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar Photo */}
            <Link href="/" onClick={() => setIsOpen(false)} className="group relative block mb-3">
              <div className={cn(
                "relative rounded-full overflow-hidden border border-slate-200/25 dark:border-slate-800/20 shadow-md bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-all duration-300 group-hover:scale-105",
                isCollapsed ? "w-10 h-10" : "w-28 h-28"
              )}>
                {profile.avatar_url ? (
                  <BlurImage 
                    src={profile.avatar_url} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-foreground font-black text-xs animate-pulse">
                    <span>{profile.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Name with Verified Blue Checkmark */}
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200">
                <div className="flex items-center gap-1 justify-center">
                  <h2 className="font-extrabold text-sm text-foreground tracking-tight">{profile.name}</h2>
                  {/* Blue verified checkmark */}
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#1d9bf0] text-white shrink-0 shadow-sm" title="Verified Professional">
                    <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                </div>

                {/* Handle */}
                <span className="text-[11px] text-muted-foreground mt-0.5 font-mono block">{handle}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-200 text-xs font-semibold group border",
                    isCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5",
                    isActive 
                      ? "bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5 scale-[1.01]" 
                      : "text-muted-foreground border-transparent hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-0.5"
                  )}
                >
                  <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2.5")}>
                    <Icon className={cn(
                      "w-4 h-4 transition-transform duration-200 group-hover:scale-110", 
                      isActive ? "text-primary scale-105" : "text-muted-foreground group-hover:text-foreground/80"
                    )} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4">
          {/* Theming Section */}
          <div className={cn("pt-3 border-t border-slate-200/20 dark:border-slate-800/10 space-y-2", isCollapsed ? "px-1" : "px-3.5")}>
            {!isCollapsed && (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/60 block">Theming</span>
            )}
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
              {!isCollapsed ? (
                <>
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
                </>
              ) : (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl glass-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle dark mode"
                >
                  {!mounted ? (
                    <div className="w-4 h-4 rounded-md bg-slate-200/30 dark:bg-slate-800/30 animate-pulse" />
                  ) : theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Social Networks Section */}
          <div className={cn("pt-3 border-t border-slate-200/20 dark:border-slate-800/10 space-y-2", isCollapsed ? "px-1" : "px-3.5")}>
            {!isCollapsed && (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/60 block">Social Networks</span>
            )}
            <div className={cn("flex items-center gap-2", isCollapsed ? "flex-col justify-center" : "flex-row")}>
              {socials.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg glass-card text-muted-foreground hover:text-foreground hover:scale-105 hover:border-primary/25 transition-all cursor-pointer"
                    aria-label={social.label}
                    title={isCollapsed ? social.label : undefined}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-slate-200/20 dark:border-slate-800/20 pt-3 text-center text-[10px] text-muted-foreground/80">
            <span>{isCollapsed ? "© '26" : "© 2026 Al Fitra Nur Ramadhani"}</span>
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

