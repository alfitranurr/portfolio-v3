'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Sparkles, Code2, Search, SlidersHorizontal, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { BlurImage } from '@/components/ui/blur-image'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'

interface ProjectsFilterListProps {
  initialProjects: Project[]
}

function getInitialProjectCategory(): 'data' | 'non-data' {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('project_public_active_category') || localStorage.getItem('project_public_active_category')
      if (stored === 'data' || stored === 'non-data') {
        return stored
      }
    } catch {
      // fallback
    }
  }
  return 'data'
}

export function ProjectsFilterList({ initialProjects }: ProjectsFilterListProps) {
  const [activeCategory, setActiveCategory] = React.useState<'data' | 'non-data'>(getInitialProjectCategory)
  const [selectedSubCategories, setSelectedSubCategories] = React.useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  const handleCategoryChange = (cat: 'data' | 'non-data') => {
    setActiveCategory(cat)
    try {
      sessionStorage.setItem('project_public_active_category', cat)
      localStorage.setItem('project_public_active_category', cat)
    } catch {
      // ignore
    }
  }

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

  // Reset subcategory and search when category switches
  const isFirstMount = React.useRef(true)
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    setSelectedSubCategories([])
    setSearchQuery('')
  }, [activeCategory])


  const handleToggleSubCategory = (sub: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(sub)
        ? prev.filter(item => item !== sub)
        : [...prev, sub]
    )
  }

  type SortField = 'pinned' | 'featured' | 'newest' | 'oldest' | 'title'
  const [sortField, setSortField] = React.useState<SortField>('pinned')

  const filteredAndSortedProjects = React.useMemo(() => {
    const result = initialProjects.filter((project) => {
      const categoryMatch = project.category === activeCategory
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

    result.sort((a, b) => {
      if (sortField === 'pinned') {
        return (a.pinned_order ?? a.featured_order ?? 999) - (b.pinned_order ?? b.featured_order ?? 999)
      }
      if (sortField === 'featured') {
        if (a.is_featured !== b.is_featured) {
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        }
        return (a.featured_order ?? a.pinned_order ?? 999) - (b.featured_order ?? b.pinned_order ?? 999)
      }
      if (sortField === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      }
      if (sortField === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return result
  }, [initialProjects, activeCategory, selectedSubCategories, searchQuery, sortField])

  return (
    <div className="space-y-8">
      {/* Top Level Category Tabs */}
      <div className="flex justify-center px-2">
        <div className="flex p-1 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-md w-full relative">
          <button
            type="button"
            onClick={() => handleCategoryChange('data')}
            className={cn(
              "flex-1 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-extrabold rounded-xl transition-colors duration-200 relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap z-10",
              activeCategory === 'data'
                ? "text-primary-foreground"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            {activeCategory === 'data' && (
              <motion.div
                layoutId="activeProjectCategoryTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Data Science</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('non-data')}
            className={cn(
              "flex-1 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-extrabold rounded-xl transition-colors duration-200 relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap z-10",
              activeCategory === 'non-data'
                ? "text-primary-foreground"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            {activeCategory === 'non-data' && (
              <motion.div
                layoutId="activeProjectCategoryTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>General Dev</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-3 relative z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/45 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
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

          {/* Sort Selector & Counter */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <CustomSortDropdown
              value={sortField}
              onChange={setSortField}
              options={[
                { label: 'Pinned Order', value: 'pinned' },
                { label: 'Featured First', value: 'featured' },
                { label: 'Newest First', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
                { label: 'Title (A-Z)', value: 'title' },
              ]}
            />

            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filteredAndSortedProjects.length} {filteredAndSortedProjects.length === 1 ? 'entry' : 'entries'}
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
              className="p-4 rounded-2xl glass-panel border border-slate-300 dark:border-slate-800/10 space-y-3"
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
                          : "bg-white dark:bg-white/5 border-slate-300 dark:border-slate-800/10 hover:border-slate-400 dark:hover:border-slate-700 text-foreground/80 hover:text-foreground shadow-2xs"
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
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/10 text-foreground shadow-2xs"
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
      <div className="w-full !-mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredAndSortedProjects.map((project) => (
                <div
                  key={project.id}
                  className="group p-6 rounded-3xl glass-panel hover:border-primary/20 flex flex-col justify-between transition-[border-color,box-shadow] duration-300 relative overflow-hidden transform-gpu w-full"
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md">
                          {getSubCategoryLabel(project.sub_category)}
                        </span>
                        {project.is_on_progress && (
                          <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shrink-0">
                            On Progress
                          </span>
                        )}
                      </div>
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
                </div>
              ))}
            </div>

            {filteredAndSortedProjects.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground text-sm font-semibold">
                No projects found in this category yet.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
