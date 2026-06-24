'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Sparkles, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { BlurImage } from '@/components/ui/blur-image'

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
    'Automation Projects',
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

  const getSubCategoryLabel = (sub: string) => {
    if (sub === 'Data Automation Projects' || sub === 'Automation Projects') {
      return 'Automation'
    }
    return sub.replace(' Projects', '')
  }

  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    const stored = sessionStorage.getItem('project_public_active_category')
    if (stored === 'data' || stored === 'non-data') {
      const timer = setTimeout(() => setActiveCategory(stored), 0)
      return () => clearTimeout(timer)
    }
  }, [])

  // Reset subcategory and search when category switches
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSubCategory('All')
      setSearchQuery('')
    }, 0)
    return () => clearTimeout(timer)
  }, [activeCategory])

  const filteredProjects = initialProjects.filter((project) => {
    const categoryMatch = project.category === activeCategory
    
    // Normalize subcategory match for backward compatibility
    const normalizedProjSub = project.sub_category === 'Data Automation Projects' ? 'Automation Projects' : project.sub_category
    const normalizedActiveSub = activeSubCategory === 'Data Automation Projects' ? 'Automation Projects' : activeSubCategory

    const subCategoryMatch = normalizedActiveSub === 'All' || normalizedProjSub === normalizedActiveSub
    const searchMatch = searchQuery.trim() === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && subCategoryMatch && searchMatch
  })

  return (
    <div className="space-y-8">
      {/* Top Level Category Tabs */}
      <div className="flex justify-center px-2">
        <div className="flex p-1 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-md w-full">
          <button
            onClick={() => {
              setActiveCategory('data')
              sessionStorage.setItem('project_public_active_category', 'data')
            }}
            className={cn(
              "flex-1 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap",
              activeCategory === 'data'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Data Science</span>
          </button>
          <button
            onClick={() => {
              setActiveCategory('non-data')
              sessionStorage.setItem('project_public_active_category', 'non-data')
            }}
            className={cn(
              "flex-1 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap",
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
            {getSubCategoryLabel(sub)}
          </button>
        ))}
      </div>

      {/* Search and Showing entries count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground/60 px-1 border-b border-slate-200/10 dark:border-slate-800/10 pb-0">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/45 text-xs focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <div className="shrink-0 font-medium self-end sm:self-auto pb-1">
          Showing <span className="text-foreground font-semibold">{filteredProjects.length}</span> {filteredProjects.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Interactive Project Cards Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 !-mt-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              layout="position"
              key={project.id}
              initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="group p-6 rounded-3xl glass-panel hover:border-primary/20 flex flex-col justify-between transition-[border-color,box-shadow] duration-300 relative overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <div className="space-y-4">
                {/* Thumbnail container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200/10 to-slate-200/5 dark:from-slate-800/10 dark:to-slate-800/5 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center">
                  {project.cover_image ? (
                    <>
                      {/* Ambient blur background */}
                      <BlurImage 
                        src={project.cover_image} 
                        alt="" 
                        initialBlur="blur-xl opacity-0"
                        initialScale="scale-110"
                        loadedBlur="blur-xl opacity-30"
                        loadedScale="scale-110"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-500 select-none pointer-events-none"
                      />
                      {/* Contained foreground image */}
                      <BlurImage 
                        src={project.cover_image} 
                        alt={project.title} 
                        className="w-full h-full object-contain relative z-10 group-hover:scale-103 transition-transform duration-500"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 flex flex-col items-center justify-center p-4">
                      <span className="text-primary/25 group-hover:text-primary/50 group-hover:scale-110 transition-all font-black uppercase tracking-widest text-[9px] text-center leading-normal">
                        {getSubCategoryLabel(project.sub_category)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider">
                    {getSubCategoryLabel(project.sub_category)}
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
                  className="flex items-center gap-1 text-xs font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <span>Explore Writeup</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
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
