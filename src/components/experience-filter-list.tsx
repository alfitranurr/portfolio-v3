'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Calendar, MapPin, Users, ChevronDown } from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import { Experience } from '@/lib/types'
import { SafeLogo } from '@/components/safe-logo'

interface ExperienceFilterListProps {
  initialExperience: Experience[]
}

function getInitialExperienceCategory(): 'professional' | 'committee_organization' {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('experience_public_active_category') || localStorage.getItem('experience_public_active_category')
      if (stored === 'professional' || stored === 'committee_organization') {
        return stored
      }
    } catch {
      // fallback
    }
  }
  return 'professional'
}

export function ExperienceFilterList({ initialExperience }: ExperienceFilterListProps) {
  const [activeCategory, setActiveCategory] = React.useState<'professional' | 'committee_organization'>(getInitialExperienceCategory)
  const [expandedRoles, setExpandedRoles] = React.useState<Record<string, boolean>>({})

  const handleCategoryChange = (cat: 'professional' | 'committee_organization') => {
    setActiveCategory(cat)
    try {
      sessionStorage.setItem('experience_public_active_category', cat)
      localStorage.setItem('experience_public_active_category', cat)
    } catch {
      // ignore
    }
  }

  const toggleRole = (id: string) => {
    setExpandedRoles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredExperience = initialExperience.filter((exp) => {
    if (activeCategory === 'professional') {
      return exp.category === 'professional' || !exp.category
    }
    return exp.category === 'committee_organization'
  })

  interface GroupedExperience {
    company: string
    logo_url?: string | null
    location?: string | null
    start_date: string
    end_date: string | null
    is_current: boolean
    roles: Experience[]
  }


  // Group experiences by company name
  const groupExperiences = (exps: Experience[]): GroupedExperience[] => {
    const groups: { [key: string]: GroupedExperience } = {}
    
    for (const exp of exps) {
      const key = exp.company.trim()
      if (!groups[key]) {
        groups[key] = {
          company: exp.company,
          logo_url: exp.logo_url,
          location: exp.location,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: !!exp.is_current,
          roles: []
        }
      }
      
      const group = groups[key]
      group.roles.push(exp)
      
      if (new Date(exp.start_date) < new Date(group.start_date)) {
        group.start_date = exp.start_date
      }
      
      if (group.is_current || exp.is_current) {
        group.is_current = true
        group.end_date = null
      } else {
        if (group.end_date && exp.end_date) {
          if (new Date(exp.end_date) > new Date(group.end_date)) {
            group.end_date = exp.end_date
          }
        } else if (exp.end_date) {
          group.end_date = exp.end_date
        }
      }
      
      if (!group.logo_url && exp.logo_url) {
        group.logo_url = exp.logo_url
      }
      if (!group.location && exp.location) {
        group.location = exp.location
      }
    }
    
    return Object.values(groups).map(g => {
      g.roles.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      return g
    }).sort((a, b) => {
      const latestA = new Date(a.roles[0].start_date).getTime()
      const latestB = new Date(b.roles[0].start_date).getTime()
      return latestB - latestA
    })
  }

  const groupedExperiences = groupExperiences(filteredExperience)

  const Icon = activeCategory === 'professional' ? Briefcase : Users

  return (
    <div className="space-y-6 w-full">
      {/* Top Level Category Tabs */}
      <div className="flex justify-center px-2">
        <div className="flex p-1 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-lg w-full relative">
          <button
            type="button"
            onClick={() => handleCategoryChange('professional')}
            className={cn(
              "flex-1 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-extrabold rounded-xl transition-colors duration-200 relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap z-10",
              activeCategory === 'professional'
                ? "text-primary-foreground"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            {activeCategory === 'professional' && (
              <motion.div
                layoutId="activeExperienceTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Professional Experience</span>
            <span className="inline sm:hidden">Professional</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('committee_organization')}
            className={cn(
              "flex-1 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-extrabold rounded-xl transition-colors duration-200 relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap z-10",
              activeCategory === 'committee_organization'
                ? "text-primary-foreground"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            {activeCategory === 'committee_organization' && (
              <motion.div
                layoutId="activeExperienceTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Committee & Organization</span>
            <span className="inline sm:hidden">Organization</span>
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="w-full py-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 w-full"
          >
            {groupedExperiences.map((group) => {
              const isSingle = group.roles.length === 1
              const singleExp = group.roles[0]

              return (
                <div
                  key={group.company}
                  className="w-full relative group transform-gpu"
                >
                  {isSingle ? (
                    /* Glassmorphic Event Card for Single Role */
                    <div className="w-full p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-[border-color,background-color,box-shadow] duration-300 space-y-4 relative overflow-hidden">
                      {/* Subtle left indicator bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/40 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex gap-4 items-start min-w-0 flex-1">
                          {singleExp.logo_url && (
                            <SafeLogo src={singleExp.logo_url} alt={singleExp.company} />
                          )}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl">
                              <Icon className="w-5 h-5 shrink-0" />
                              <h2 className="break-words">{singleExp.role}</h2>
                            </div>
                            <h3 className="font-semibold text-foreground/90 break-words">{singleExp.company}</h3>
                          </div>
                        </div>

                        {/* Metadata row on the right */}
                        <div className="flex flex-col md:items-end gap-1.5 text-xs text-muted-foreground self-start md:self-auto shrink-0 md:text-right font-medium md:min-w-[210px]">
                          {singleExp.is_current && (
                            <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md text-[10px] font-extrabold animate-pulse md:mb-0.5 self-start md:self-auto">
                              Current
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 md:flex-row-reverse">
                            <Calendar className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                            <span>
                              {new Date(singleExp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              {' - '}
                              {singleExp.end_date 
                                ? new Date(singleExp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                : 'Present'}
                              {` · ${formatDuration(singleExp.start_date, singleExp.end_date, !!singleExp.is_current)}`}
                            </span>
                          </span>
                          {singleExp.location && (
                            <span className="flex items-center gap-1.5 md:flex-row-reverse">
                              <MapPin className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                              <span>{singleExp.location}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Toggle Button */}
                      {singleExp.description && singleExp.description.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => toggleRole(singleExp.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer outline-none group"
                          >
                            <span>{!!expandedRoles[singleExp.id] ? 'Hide Responsibilities' : 'Show Responsibilities'}</span>
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", !!expandedRoles[singleExp.id] && "rotate-180")} />
                          </button>
                        </div>
                      )}

                      {/* Responsibilities list */}
                      {singleExp.description && singleExp.description.length > 0 && (
                        <AnimatePresence initial={false}>
                          {!!expandedRoles[singleExp.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, y: -10 }}
                              animate={{ height: 'auto', opacity: 1, y: 0 }}
                              exit={{ height: 0, opacity: 0, y: -10 }}
                              transition={{ 
                                height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
                                opacity: { duration: 0.25 },
                                y: { duration: 0.25 }
                              }}
                              className="overflow-hidden"
                            >
                              <ul className="space-y-2 pt-3 border-t border-slate-200/10 dark:border-slate-800/10 text-sm text-foreground/85 list-disc list-inside">
                                {singleExp.description.map((bullet, index) => (
                                  <li key={index} className="leading-relaxed pl-1">
                                    <span className="ml-1.5">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  ) : (
                    /* Glassmorphic Event Card for Multiple Roles */
                    <div className="w-full p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-[border-color,background-color,box-shadow] duration-300 space-y-6 relative overflow-hidden">
                      {/* Subtle left indicator bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/40 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                      
                      {/* Company Header matching Single Role right-side metadata */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
                        <div className="flex gap-4 items-start min-w-0 flex-1">
                          {group.logo_url && (
                            <SafeLogo src={group.logo_url} alt={group.company} />
                          )}
                          <div className="space-y-1 min-w-0 flex-1">
                            <h2 className="text-xl md:text-2xl font-black text-foreground break-words">{group.company}</h2>
                          </div>
                        </div>

                        {/* Overall info on the right */}
                        <div className="flex flex-col md:items-end gap-1.5 text-xs text-muted-foreground self-start md:self-auto shrink-0 md:text-right font-medium md:min-w-[210px]">
                          {group.is_current && (
                            <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md text-[10px] font-extrabold animate-pulse md:mb-0.5 self-start md:self-auto">
                              Current
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 md:flex-row-reverse">
                            <Calendar className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                            <span>
                              {new Date(group.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              {' - '}
                              {group.is_current 
                                ? 'Present' 
                                : group.end_date 
                                  ? new Date(group.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                  : 'Present'}
                              {` · ${formatDuration(group.start_date, group.end_date, group.is_current)}`}
                            </span>
                          </span>
                          {group.location && (
                            <span className="flex items-center gap-1.5 md:flex-row-reverse">
                              <MapPin className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                              <span>{group.location}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nested Roles List */}
                      <div className="space-y-8 py-2">
                        {group.roles.map((role) => (
                          <div key={role.id} className="relative group/role">
                            <div className="space-y-2">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <h3 className="font-extrabold text-foreground text-base md:text-lg flex items-center gap-2 group-hover/role:text-primary transition-colors">
                                    <Icon className="w-4 h-4 text-primary shrink-0" />
                                    <span className="break-words">{role.role}</span>
                                  </h3>
                                </div>
                                
                                <div className="flex flex-col md:items-end gap-1 text-xs text-muted-foreground self-start md:self-auto shrink-0 md:text-right font-medium md:min-w-[210px]">
                                  {role.is_current && (
                                    <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md text-[10px] font-extrabold animate-pulse md:mb-0.5 self-start md:self-auto">
                                      Current Role
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1.5 md:flex-row-reverse">
                                    <Calendar className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                                    <span>
                                      {new Date(role.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                      {' - '}
                                      {role.end_date 
                                        ? new Date(role.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                        : 'Present'}
                                      {` · ${formatDuration(role.start_date, role.end_date, !!role.is_current)}`}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Toggle Button */}
                              {role.description && role.description.length > 0 && (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleRole(role.id)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer outline-none group"
                                  >
                                    <span>{!!expandedRoles[role.id] ? 'Hide Responsibilities' : 'Show Responsibilities'}</span>
                                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", !!expandedRoles[role.id] && "rotate-180")} />
                                  </button>
                                </div>
                              )}

                              {/* Role Bullet Points */}
                              {role.description && role.description.length > 0 && (
                                <AnimatePresence initial={false}>
                                  {!!expandedRoles[role.id] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0, y: -10 }}
                                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                                      exit={{ height: 0, opacity: 0, y: -10 }}
                                      transition={{ 
                                        height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
                                        opacity: { duration: 0.25 },
                                        y: { duration: 0.25 }
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <ul className="space-y-1.5 text-xs md:text-sm text-foreground/80 list-disc list-inside pl-1 pt-2">
                                        {role.description.map((bullet, index) => (
                                          <li key={index} className="leading-relaxed">
                                            <span className="ml-1">{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {groupedExperiences.length === 0 && (
              <div className="py-16 text-center text-muted-foreground text-sm font-semibold">
                No experiences found in this category.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
