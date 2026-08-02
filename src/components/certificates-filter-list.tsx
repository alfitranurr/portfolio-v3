'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Calendar, ExternalLink, ShieldCheck, Trophy, Landmark, Users, Search, SlidersHorizontal, Check, X } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { Certificate } from '@/lib/types'
import { BlurImage } from '@/components/ui/blur-image'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'

interface CertificatesFilterListProps {
  initialCertificates: Certificate[]
}

const CATEGORY_MAP = {
  All: 'All Credentials',
  competition: 'Competitions',
  seminar_workshop: 'Seminars & Workshops',
  license_certification: 'Licenses & Certifications',
  committee_organization: 'Work & Organizations',
}

const ICON_MAP = {
  competition: Trophy,
  seminar_workshop: Landmark,
  license_certification: ShieldCheck,
  committee_organization: Users,
}

const BADGE_MAP = {
  competition: 'Competition',
  seminar_workshop: 'Seminar & Workshop',
  license_certification: 'License & Certification',
  committee_organization: 'Work & Organization',
}

const CATEGORY_COLOR_MAP: Record<string, { badge: string; icon: string }> = {
  license_certification: {
    badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    icon: 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/20'
  },
  competition: {
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20'
  },
  seminar_workshop: {
    badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: 'bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/20'
  },
  committee_organization: {
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20'
  }
}




export function CertificatesFilterList({ initialCertificates }: CertificatesFilterListProps) {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  type SortField = 'newest' | 'oldest' | 'title' | 'issuer'
  const [sortField, setSortField] = React.useState<SortField>('newest')

  const categories = ['All', 'competition', 'seminar_workshop', 'license_certification', 'committee_organization']

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(item => item !== cat)
        : [...prev, cat]
    )
  }

  const filteredAndSortedCertificates = React.useMemo(() => {
    const result = initialCertificates.filter(c => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(c.category)
      const q = search.toLowerCase()
      const matchesSearch = c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        (c.credential_id && c.credential_id.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.issue_date || 0).getTime() - new Date(b.issue_date || 0).getTime()
      }
      if (sortField === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortField === 'issuer') {
        return a.issuer.localeCompare(b.issuer)
      }
      return 0
    })

    return result
  }, [initialCertificates, selectedCategories, search, sortField])

  return (
    <div className="space-y-6">
      {/* Search and Filters panel wrapper */}
      <div className="space-y-3 relative z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0",
                isFilterOpen || selectedCategories.length > 0
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/5 border-slate-300 dark:border-slate-800/20 text-foreground/80 hover:text-foreground hover:bg-white/10"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {selectedCategories.length > 0 && (
                <span className="ml-0.5 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
          {/* Sort Selector & Counter */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <CustomSortDropdown
              value={sortField}
              onChange={setSortField}
              options={[
                { label: 'Newest First', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
                { label: 'Title (A-Z)', value: 'title' },
                { label: 'Issuer (A-Z)', value: 'issuer' },
              ]}
            />

            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filteredAndSortedCertificates.length} {filteredAndSortedCertificates.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="p-4 rounded-2xl glass-panel border border-slate-300 dark:border-slate-800/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                  Filter by Category (Multiple Select)
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.filter(cat => cat !== 'All').map((cat) => {
                  const isSelected = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                          : "bg-white dark:bg-white/5 border-slate-300 dark:border-slate-800/20 hover:border-slate-400 dark:hover:border-slate-700 text-foreground/80 hover:text-foreground shadow-2xs"
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span>{CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Selected Badges */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center px-1 pt-1">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mr-1">
              Active Filters:
            </span>
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground shadow-2xs"
              >
                <span>{CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]}</span>
                <button
                  type="button"
                  onClick={() => handleToggleCategory(cat)}
                  className="hover:text-red-500 transition-colors cursor-pointer text-muted-foreground/60"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Certificates Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedCertificates.map((cert) => {
            const Icon = ICON_MAP[cert.category as keyof typeof ICON_MAP] || Award
            const colors = CATEGORY_COLOR_MAP[cert.category] || {
              badge: 'bg-primary/15 text-primary border-primary/30',
              icon: 'bg-primary/15 text-primary border border-primary/20'
            }
            return (
              <motion.div
                layout="position"
                key={cert.id}
                initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="group p-6 rounded-3xl glass-panel border border-slate-300/80 dark:border-slate-800/30 hover:border-primary/40 shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle top indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="space-y-4">
                  {/* Category icon header */}
                  <div className="flex items-center justify-between">
                    <div className={cn("p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-105", colors.icon)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-2xs transition-all duration-300 border",
                      colors.badge
                    )}>
                      {BADGE_MAP[cert.category as keyof typeof BADGE_MAP] || cert.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Image container */}
                  {cert.image_url && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100/90 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800/60 shadow-xs flex items-center justify-center">
                      {/* Ambient blur background */}
                      <BlurImage 
                        src={getDirectImageUrl(cert.image_url)} 
                        alt="" 
                        initialBlur="blur-xl opacity-0"
                        initialScale="scale-110"
                        loadedBlur="blur-xl opacity-30"
                        loadedScale="scale-110"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-500 select-none pointer-events-none"
                      />
                      {/* Contained foreground image */}
                      <BlurImage 
                        src={getDirectImageUrl(cert.image_url)} 
                        alt={cert.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain relative z-10 group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Title & Info */}
                  <div className="space-y-2.5">
                    <h3 className="font-bold text-xs sm:text-[13px] leading-snug text-foreground group-hover:text-primary transition-colors text-justify">
                      {cert.title}
                    </h3>
                    
                    {/* Divider and Metadata layout aligned with left margin */}
                    <div className="border-t border-slate-200/10 dark:border-slate-800/20 pt-2.5 space-y-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50 font-bold">Organizer</span>
                        <span className="text-[11px] font-semibold text-foreground/90 mt-0.5">{cert.issuer}</span>
                      </div>
                      {cert.credential_id && (
                        <div className="flex flex-col border-t border-slate-200/10 dark:border-slate-800/30 pt-2 mt-2">
                          <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50 font-bold">Credential ID</span>
                          <span className="text-[9.5px] font-mono text-muted-foreground mt-0.5 break-all">{cert.credential_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200/10 dark:border-slate-800/10 mt-3">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </span>
                  
                  {cert.image_url && (
                    <a
                      href={cert.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      <span>View Certificate</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredAndSortedCertificates.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm font-semibold">
            No credentials found in this category yet.
          </div>
        )}
      </motion.div>
    </div>
  )
}
