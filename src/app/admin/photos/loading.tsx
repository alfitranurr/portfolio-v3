import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import {
  AdminPageHeaderSkeleton,
  AdminControlsPanelSkeleton,
  SearchSortRowSkeleton,
  ControlsFooterSkeleton,
} from '@/components/admin/shared/AdminPageSkeleton'

// Default: view grid, 12 per halaman (satu baris kartu di desktop)
const TITLE_WIDTHS = ['w-[147px]', 'w-[120px]', 'w-[160px]', 'w-[110px]']

export default function AdminPhotosLoading() {
  return (
    <div className="space-y-8 w-full">
      <AdminPageHeaderSkeleton
        titleWidth="w-[174px] sm:w-[218px]"
        subtitleWidth="w-[274px] sm:w-[320px]"
        buttonWidth="w-[119px]"
      />

      <div className="space-y-4">
        <AdminControlsPanelSkeleton>
          <SearchSortRowSkeleton placeholderWidth="w-[214px]" activeView="grid" />
          <ControlsFooterSkeleton counterWidth="w-[110px]" />
        </AdminControlsPanelSkeleton>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {TITLE_WIDTHS.map((w, i) => (
            <div key={i} className="rounded-2xl glass-panel border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shimmer-card">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-3 space-y-1">
                <SkeletonText size="sm" className={w} />
                <SkeletonText size="2xs" className="w-[24px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
