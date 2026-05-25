'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ExternalLink, Sparkles, Presentation } from 'lucide-react'
import { Github } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'

interface ProjectsFilterListProps {
  initialProjects: Project[]
}

export function ProjectsFilterList({ initialProjects }: ProjectsFilterListProps) {
  const [activeCategory, setActiveCategory] = React.useState<'data' | 'non-data'>('data')
  const [activeSubCategory, setActiveSubCategory] = React.useState<string>('All')

  const dataSubcategories = [
    'All',
    'Data Visualization Projects',
    'Data Analytics Projects',
    'Artificial Intelligence Projects',
    'Data Automation Projects',
    'Data Modeling and Simulation Projects',
  ]

  const nonDataSubcategories = [
    'All',
    'Web Development Projects',
    'Mobile Development Projects',
    'Digital Marketing Projects',
    'Graphic Design Projects',
  ]

  const subCategories = activeCategory === 'data' ? dataSubcategories : nonDataSubcategories

  // Reset subcategory selection when category switches
  React.useEffect(() => {
    setActiveSubCategory('All')
  }, [activeCategory])

  const filteredProjects = initialProjects.filter((project) => {
    const categoryMatch = project.category === activeCategory
    const subCategoryMatch = activeSubCategory === 'All' || project.sub_category === activeSubCategory
    return categoryMatch && subCategoryMatch
  })

  return (
    <div className="space-y-8">
      {/* Top Level Category Tabs */}
      <div className="flex justify-center">
        <div className="flex p-1.5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-md w-full">
          <button
            onClick={() => setActiveCategory('data')}
            className={cn(
              "flex-1 py-2.5 text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1.5",
              activeCategory === 'data'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Data Science</span>
          </button>
          <button
            onClick={() => setActiveCategory('non-data')}
            className={cn(
              "flex-1 py-2.5 text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1.5",
              activeCategory === 'non-data'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            <span>General Dev</span>
          </button>
        </div>
      </div>

      {/* Sub-category Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {subCategories.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubCategory(sub)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer",
              activeSubCategory === sub
                ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-foreground/80 hover:text-foreground"
            )}
          >
            {sub.replace(' Projects', '')}
          </button>
        ))}
      </div>

      {/* Interactive Project Cards Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group p-6 rounded-3xl glass-panel hover:border-primary/20 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <div className="space-y-4">
                {/* Thumbnail container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200/10 to-slate-200/5 dark:from-slate-800/10 dark:to-slate-800/5 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center">
                  {project.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={project.cover_image} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 flex flex-col items-center justify-center p-4">
                      <span className="text-primary/25 group-hover:text-primary/50 group-hover:scale-110 transition-all font-black uppercase tracking-widest text-[9px] text-center leading-normal">
                        {project.sub_category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider">
                    {project.sub_category}
                  </span>
                  <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10 mt-4">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                >
                  <span>Explore Writeup</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                
                <div className="ml-auto flex items-center gap-1.5">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all"
                      aria-label="GitHub Repository"
                      title="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.slide_url && (
                    <a
                      href={project.slide_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all"
                      aria-label="Reporting Presentation"
                      title="Reporting Presentation"
                    >
                      <Presentation className="w-4 h-4" />
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all"
                      aria-label="Live Demo"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm font-semibold">
            No projects found in this category yet.
          </div>
        )}
      </motion.div>
    </div>
  )
}
