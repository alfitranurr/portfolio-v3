import * as React from 'react'
import { motion } from 'framer-motion'
import { Search, X, LayoutGrid, LayoutList, Sparkles, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'
import { CATEGORIES, CATEGORY_MAP, SortField } from './types'

interface ExperienceControlsProps {
  search: string
  onSearchChange: (search: string) => void
  activeCategory: string
  onCategoryChange: (category: string) => void
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  sortField: SortField
  onSortFieldChange: (field: SortField) => void
  totalItems: number
  displayedItems: number
}

export function ExperienceControls({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  totalItems,
  displayedItems
}: ExperienceControlsProps) {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 relative z-30">
      {/* Top row: Category Switcher */}
      <div className="flex justify-center">
        <div className="flex p-1 rounded-2xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 max-w-2xl w-full relative">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "flex-1 py-2 text-xs font-extrabold rounded-xl transition-colors duration-200 relative cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap z-10",
                activeCategory === cat
                  ? "text-primary-foreground"
                  : "text-foreground/75 hover:text-foreground"
              )}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="activeExperienceCategoryTab"
                  className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              {cat === 'professional' && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
              {cat === 'committee_organization' && <Building2 className="w-3.5 h-3.5 shrink-0" />}
              <span>{CATEGORY_MAP[cat] || cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Middle row: Search, Sort, View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search by role, company, or location..."
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
            onChange={val => onSortFieldChange(val as SortField)}
            options={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Company (A-Z)', value: 'company' },
              { label: 'Role (A-Z)', value: 'role' },
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

      {/* Bottom row: Counter */}
      <div className="flex items-center justify-end pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
        <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
          Showing {displayedItems} of {totalItems} {totalItems === 1 ? 'experience' : 'experiences'}
        </span>
      </div>
    </div>
  )
}
