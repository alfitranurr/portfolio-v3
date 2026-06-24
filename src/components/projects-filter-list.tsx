'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Sparkles, Search, SlidersHorizontal, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { BlurImage } from '@/components/ui/blur-image'

interface ProjectsFilterListProps {
  initialProjects: Project[]
}

export function ProjectsFilterList({ initialProjects }: ProjectsFilterListProps) {
  const [activeCategory, setActiveCategory] = React.useState<'data' | 'non-data'>('data')
  const [selectedSubCategories, setSelectedSubCategories] = React.useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

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
      setSelectedSubCategories([])
      setSearchQuery('')
    }, 0)
    return () => clearTimeout(timer)
  }, [activeCategory])

  const handleToggleSubCategory = (sub: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(sub)
        ? prev.filter(item => item !== sub)
        : [...prev, sub]
    )
  }

  const filteredProjects = initialProjects.filter((project) => {
    const categoryMatch = project.category === activeCategory
    
    // Normalize subcategory match for backward compatibility
    const normalizedProjSub = project.sub_category === 'Data Automation Projects' ? 'Automation Projects' : project.sub_category

    const subCategoryMatch = selectedSubCategories.length === 0 || selectedSubCategories.some(selectedSub => {
      const normalizedSelectedSub = selectedSub === 'Data Automation Projects' ? 'Automation Projects' : selectedSub
      return normalizedProjSub === normalizedSelectedSub
    })

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

      {/* Search and Filter Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground/60 px-1 pb-0">
          <div className="relative w-full sm:max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/45 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0",
                isFilterOpen || selectedSubCategories.length > 0
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/5 border-slate-300 dark:border-slate-800/10 text-foreground/80 hover:text-foreground hover:bg-white/10"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {selectedSubCategories.length > 0 && (
                <span className="ml-0.5 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  {selectedSubCategories.length}
                </span>
              )}
            </button>
          </div>

          <div className="shrink-0 font-medium self-end sm:self-auto pb-1">
            Showing <span className="text-foreground font-semibold">{filteredProjects.length}</span> {filteredProjects.length === 1 ? 'entry' : 'entries'}
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
              className="p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                  Filter by Sub Category (Multiple Select)
                </span>
                {selectedSubCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubCategories([])}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {subCategories.filter(sub => sub !== 'All').map((sub) => {
                  const isSelected = selectedSubCategories.includes(sub)
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleToggleSubCategory(sub)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                          : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-foreground/80 hover:text-foreground"
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span>{getSubCategoryLabel(sub)}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Selected Badges */}
        {selectedSubCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center px-1 pt-1">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mr-1">
              Active Filters:
            </span>
            {selectedSubCategories.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground"
              >
                <span>{getSubCategoryLabel(sub)}</span>
                <button
                  type="button"
                  onClick={() => handleToggleSubCategory(sub)}
                  className="hover:text-red-500 transition-colors cursor-pointer text-muted-foreground/60"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
