import * as React from 'react'
import { Search, X, LayoutGrid, LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'
import { SortField } from './types'

interface EducationControlsProps {
  search: string
  onSearchChange: (search: string) => void
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  sortField: SortField
  onSortFieldChange: (field: SortField) => void
  totalItems: number
  displayedItems: number
}

export function EducationControls({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  totalItems,
  displayedItems
}: EducationControlsProps) {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 relative z-30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search by institution, degree, or field..."
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

        <div className="flex items-center gap-2 shrink-0">
          <CustomSortDropdown
            value={sortField}
            onChange={val => onSortFieldChange(val as SortField)}
            options={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Institution (A-Z)', value: 'institution' },
              { label: 'Degree (A-Z)', value: 'degree' },
            ]}
          />

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

      <div className="flex items-center justify-end pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
        <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
          Showing {displayedItems} of {totalItems} {totalItems === 1 ? 'education' : 'educations'}
        </span>
      </div>
    </div>
  )
}
