import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, LayoutGrid, LayoutList, Sparkles, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'
import { SUBCATEGORY_MAP } from './types'

interface ProjectControlsProps {
  activeCategory: 'data' | 'non-data'
  onCategoryChange: (category: 'data' | 'non-data') => void
  search: string
  onSearchChange: (search: string) => void
  activeSubCategory: string
  onSubCategoryChange: (subCategory: string) => void
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  sortField: 'pinned' | 'featured' | 'newest' | 'oldest' | 'title'
  onSortFieldChange: (field: 'pinned' | 'featured' | 'newest' | 'oldest' | 'title') => void
  availableFilters: string[]
  totalItems: number
  displayedItems: number
}

export function ProjectControls({
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  activeSubCategory,
  onSubCategoryChange,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  availableFilters,
  totalItems,
  displayedItems
}: ProjectControlsProps) {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 relative z-30">
      {/* Top row: Main Category Switcher */}
      <div className="flex justify-center">
        <div className="flex p-1 rounded-2xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 max-w-md w-full relative">
          <button
            type="button"
            onClick={() => {
              onCategoryChange('data')
              sessionStorage.setItem('project_admin_active_category', 'data')
            }}
            className={cn(
              "flex-1 py-2 text-xs font-extrabold rounded-xl transition-colors duration-200 relative cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap z-10",
              activeCategory === 'data'
                ? "text-primary-foreground"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            {activeCategory === 'data' && (
              <motion.div
                layoutId="activeAdminProjectCategoryTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Data Science</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCategoryChange('non-data')
              sessionStorage.setItem('project_admin_active_category', 'non-data')
            }}
            className={cn(
              "flex-1 py-2 text-xs font-extrabold rounded-xl transition-colors duration-200 relative cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap z-10",
              activeCategory === 'non-data'
                ? "text-primary-foreground"
                : "text-foreground/75 hover:text-foreground"
            )}
          >
            {activeCategory === 'non-data' && (
              <motion.div
                layoutId="activeAdminProjectCategoryTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span>General Dev</span>
          </button>
        </div>
      </div>

      {/* Middle row: Search, Sort, View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search by title, subcategory, or description..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Field Selector */}
          <CustomSortDropdown
            value={sortField}
            onChange={val => onSortFieldChange(val as 'pinned' | 'featured' | 'newest' | 'oldest' | 'title')}
            options={[
              { label: 'Pinned Order', value: 'pinned' },
              { label: 'Featured First', value: 'featured' },
              { label: 'Newest First', value: 'newest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Title (A-Z)', value: 'title' },
            ]}
          />

          {/* View Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === 'grid'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === 'table'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Subcategory Pills & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex flex-wrap gap-1.5"
          >
            {availableFilters.map((subCategory) => (
              <button
                key={subCategory}
                type="button"
                onClick={() => onSubCategoryChange(subCategory)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
                  activeSubCategory === subCategory
                    ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10"
                    : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-muted-foreground hover:text-foreground"
                )}
              >
                {SUBCATEGORY_MAP[subCategory] || subCategory.replace(' Projects', '')}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>

        <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
          Showing {displayedItems} of {totalItems} {totalItems === 1 ? 'project' : 'projects'}
        </span>
      </div>
    </div>
  )
}
