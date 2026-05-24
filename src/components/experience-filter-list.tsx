'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Calendar, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Experience } from '@/lib/types'
import { SafeLogo } from '@/components/safe-logo'

interface ExperienceFilterListProps {
  initialExperience: Experience[]
}

export function ExperienceFilterList({ initialExperience }: ExperienceFilterListProps) {
  const [activeCategory, setActiveCategory] = React.useState<'professional' | 'committee_organization'>('professional')

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

  const formatDuration = (startDateStr: string, endDateStr: string | null, isCurrent: boolean) => {
    const start = new Date(startDateStr)
    const end = endDateStr ? new Date(endDateStr) : new Date()
    
    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    
    if (months < 0) {
      years -= 1
      months += 12
    }
    
    months += 1
    if (months >= 12) {
      years += 1
      months -= 12
    }
    
    const parts: string[] = []
    if (years > 0) {
      parts.push(`${years} yr${years > 1 ? 's' : ''}`)
    }
    if (months > 0) {
      parts.push(`${months} mo${months > 1 ? 's' : ''}`)
    }
    
    return parts.join(' ') || '1 mo'
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
    <div className="space-y-12">
      {/* Top Level Category Tabs */}
      <div className="flex justify-center">
        <div className="flex p-1.5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-lg w-full">
          <button
            onClick={() => setActiveCategory('professional')}
            className={cn(
              "flex-1 py-2.5 text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1.5",
              activeCategory === 'professional'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            <Briefcase className="w-4 h-4" />
            <span>Professional Experience</span>
          </button>
          <button
            onClick={() => setActiveCategory('committee_organization')}
            className={cn(
              "flex-1 py-2.5 text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1.5",
              activeCategory === 'committee_organization'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Committee & Organization</span>
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative border-l border-slate-200/20 dark:border-slate-800/20 ml-4 md:ml-6 pl-6 md:pl-8 space-y-10 py-2">
        <AnimatePresence mode="popLayout">
          {groupedExperiences.map((group) => {
            const isSingle = group.roles.length === 1
            const singleExp = group.roles[0]

            return (
              <motion.div
                layout
                key={group.company}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                {/* Animated Timeline Indicator Dot */}
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary group-hover:scale-125 transition-all duration-300 z-10" />

                {isSingle ? (
                  /* Glassmorphic Event Card for Single Role */
                  <div className="p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-all duration-300 space-y-4 relative overflow-hidden">
                    {/* Subtle left indicator bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/40 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex gap-4 items-start">
                        {singleExp.logo_url && (
                          <SafeLogo src={singleExp.logo_url} alt={singleExp.company} />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl">
                            <Icon className="w-5 h-5 shrink-0" />
                            <h2>{singleExp.role}</h2>
                          </div>
                          <h3 className="font-semibold text-foreground/90">{singleExp.company}</h3>
                        </div>
                      </div>

                      {/* Metadata badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground self-start md:self-auto">
                        {singleExp.is_current && (
                          <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg font-extrabold animate-pulse">
                            Current
                          </span>
                        )}
                        <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                          <Calendar className="w-3.5 h-3.5" />
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
                          <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{singleExp.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Responsibilities list */}
                    {singleExp.description && singleExp.description.length > 0 && (
                      <ul className="space-y-2 pt-3 border-t border-slate-200/10 dark:border-slate-800/10 text-sm text-foreground/85 list-disc list-inside">
                        {singleExp.description.map((bullet, index) => (
                          <li key={index} className="leading-relaxed pl-1">
                            <span className="ml-1.5">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  /* Glassmorphic Event Card for Multiple Roles */
                  <div className="p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-all duration-300 space-y-6 relative overflow-hidden">
                    {/* Subtle left indicator bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/40 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                    {/* Company Header */}
                    <div className="flex gap-4 items-start pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
                      {group.logo_url && (
                        <SafeLogo src={group.logo_url} alt={group.company} />
                      )}
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-foreground">{group.company}</h2>

                        {/* Overall info */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-semibold">
                          {group.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{group.location}</span>
                            </span>
                          )}
                          {group.location && <span>•</span>}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
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
                        </div>
                      </div>
                    </div>

                    {/* Nested Roles List */}
                    <div className="relative border-l border-slate-200/20 dark:border-slate-800/20 ml-6 pl-6 space-y-8 py-2">
                      {group.roles.map((role) => (
                        <div key={role.id} className="relative group/role">

                          {/* Nested Role Timeline Dot */}
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-background border-2 border-primary/50 group-hover/role:border-primary group-hover/role:scale-125 transition-all duration-300 z-10" />

                          <div className="space-y-2">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <h3 className="font-extrabold text-foreground text-base md:text-lg flex items-center gap-2 group-hover/role:text-primary transition-colors">
                                  <Icon className="w-4 h-4 text-primary shrink-0" />
                                  <span>{role.role}</span>
                                </h3>
                                <p className="text-xs text-muted-foreground font-semibold">
                                  {new Date(role.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                  {' - '}
                                  {role.end_date 
                                    ? new Date(role.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                    : 'Present'}
                                  {` · ${formatDuration(role.start_date, role.end_date, !!role.is_current)}`}
                                </p>
                              </div>
                              {role.is_current && (
                                <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md text-[10px] font-extrabold animate-pulse self-start md:self-auto">
                                  Current Role
                                </span>
                              )}
                            </div>

                            {/* Role Bullet Points */}
                            {role.description && role.description.length > 0 && (
                              <ul className="space-y-1.5 text-xs md:text-sm text-foreground/80 list-disc list-inside pl-1 pt-1">
                                {role.description.map((bullet, index) => (
                                  <li key={index} className="leading-relaxed">
                                    <span className="ml-1">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {groupedExperiences.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm font-semibold">
            No experiences found in this category.
          </div>
        )}
      </div>
    </div>
  )
}
