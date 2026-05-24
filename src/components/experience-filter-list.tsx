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

  // Sort by start_date descending
  const sortedExperience = [...filteredExperience].sort((a, b) => {
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  })

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
          {sortedExperience.map((exp) => (
            <motion.div
              layout
              key={exp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="relative group"
            >
              {/* Animated Timeline Indicator Dot */}
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary group-hover:scale-125 transition-all duration-300 z-10" />

              {/* Glassmorphic Event Card */}
              <div className="p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-all duration-300 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4 items-start">
                    {exp.logo_url && (
                      <SafeLogo src={exp.logo_url} alt={exp.company} />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl">
                        <Icon className="w-5 h-5 shrink-0" />
                        <h2>{exp.role}</h2>
                      </div>
                      <h3 className="font-semibold text-foreground/90">{exp.company}</h3>
                    </div>
                  </div>

                  {/* Metadata badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground self-start md:self-auto">
                    {exp.is_current && (
                      <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg font-extrabold animate-pulse">
                        Current
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        {' - '}
                        {exp.end_date 
                          ? new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                          : 'Present'}
                      </span>
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{exp.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Responsibilities list */}
                {exp.description && exp.description.length > 0 && (
                  <ul className="space-y-2 pt-3 border-t border-slate-200/10 dark:border-slate-800/10 text-sm text-foreground/85 list-disc list-inside">
                    {exp.description.map((bullet, index) => (
                      <li key={index} className="leading-relaxed pl-1">
                        <span className="ml-1.5">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedExperience.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm font-semibold">
            No experiences found in this category.
          </div>
        )}
      </div>
    </div>
  )
}
