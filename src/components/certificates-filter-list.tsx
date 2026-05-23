'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Calendar, ExternalLink, ShieldCheck, Trophy, Landmark, Users, Search } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { Certificate } from '@/lib/types'

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


export function CertificatesFilterList({ initialCertificates }: CertificatesFilterListProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('All')

  const [search, setSearch] = React.useState('')

  const categories = ['All', 'competition', 'seminar_workshop', 'license_certification', 'committee_organization']

  const filteredCertificates = initialCertificates.filter(c => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer.toLowerCase().includes(search.toLowerCase()) ||
      (c.credential_id && c.credential_id.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Search and Stats */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground font-semibold shrink-0">
          Showing {filteredCertificates.length} {filteredCertificates.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
              activeCategory === cat
                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-foreground/80 hover:text-foreground"
            )}
          >
            {CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]}
          </button>
        ))}
      </div>

      {/* Certificates Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredCertificates.map((cert) => {
            const Icon = ICON_MAP[cert.category as keyof typeof ICON_MAP] || Award
            return (
              <motion.div
                layout
                key={cert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group p-6 rounded-3xl glass-panel hover:border-primary/20 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle top indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="space-y-4">
                  {/* Category icon header */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2 py-0.5 rounded">
                      {BADGE_MAP[cert.category as keyof typeof BADGE_MAP] || cert.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Image container */}
                  {cert.image_url && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200/10 to-slate-200/5 dark:from-slate-800/10 dark:to-slate-800/5 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={getDirectImageUrl(cert.image_url)} 
                        alt={cert.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-semibold text-foreground/90">{cert.issuer}</p>
                    {cert.credential_id && (
                      <p className="text-[10px] text-muted-foreground font-mono">ID: {cert.credential_id}</p>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10 mt-4">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </span>
                  
                  {cert.image_url && (
                    <a
                      href={getDirectImageUrl(cert.image_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
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

        {filteredCertificates.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm font-semibold">
            No credentials found in this category yet.
          </div>
        )}
      </motion.div>
    </div>
  )
}
