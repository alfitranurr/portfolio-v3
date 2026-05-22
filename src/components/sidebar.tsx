'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  GraduationCap, 
  Briefcase, 
  FolderCode, 
  Award, 
  Mail, 
  Menu, 
  X,
  Terminal,
  Settings
} from 'lucide-react'
import { Github, Linkedin, Instagram } from '@/components/icons'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  // Disable sidebar on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Education', href: '/education', icon: GraduationCap },
    { name: 'Experience', href: '/experience', icon: Briefcase },
    { name: 'Projects', href: '/projects', icon: FolderCode },
    { name: 'Certificates', href: '/certificates', icon: Award },
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
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
              <Terminal className="text-primary w-6 h-6" />
              <div className="flex flex-col">
                <span className="leading-tight font-extrabold tracking-tight">Al Fitra</span>
                <span className="text-[10px] text-muted-foreground font-normal">Data Science Professional</span>
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
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
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
        <div className="space-y-5">
          {/* Social Icons */}
          <div className="flex items-center justify-center gap-3">
            {socials.map((social, index) => {
              const Icon = social.icon
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl glass-card text-muted-foreground hover:text-foreground hover:scale-110 hover:border-primary/30 transition-all cursor-pointer"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-slate-200/20 dark:border-slate-800/20 pt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>© 2026 Al Fitra</span>
            <Link 
              href="/login" 
              className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
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
