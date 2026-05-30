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
  Settings,
  MessageSquareText,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react'
import { Github, Linkedin, Instagram } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Profile } from '@/lib/types'
import { useTheme } from 'next-themes'
import { BlurImage } from '@/components/ui/blur-image'

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
          <Terminal className="text-primary w-5 h-5" />
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
          "fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-200/20 dark:border-slate-800/10 p-5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 overflow-y-auto scrollbar-hide",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:top-4 lg:bottom-4 lg:left-4 lg:rounded-3xl lg:h-[calc(100vh-2rem)]"
        )}
      >
        <div>
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-5 relative">
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-foreground cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar Photo */}
            <Link href="/" onClick={() => setIsOpen(false)} className="group relative block mb-3">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border border-slate-200/25 dark:border-slate-800/20 shadow-md bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                {profile.avatar_url ? (
                  <BlurImage 
                    src={profile.avatar_url} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-foreground font-black text-2xl animate-pulse">
                    <span>{profile.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Name with Verified Blue Checkmark */}
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
            <span className="text-[11px] text-muted-foreground mt-0.5 font-mono">{handle}</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
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

          {/* Social Networks Section */}
          <div className="pt-3 border-t border-slate-200/20 dark:border-slate-800/10 space-y-2 px-3.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/60 block">Social Networks</span>
            <div className="flex items-center gap-2.5">
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
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-slate-200/20 dark:border-slate-800/20 pt-3 text-center text-[10px] text-muted-foreground/80">
            <span>© 2026 Al Fitra Nur Ramadhani</span>
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
