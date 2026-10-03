import * as React from 'react'
import { Skeleton, SkeletonLines, SkeletonText } from '@/components/ui/skeleton'

/** Mirrors a project card in <ProjectsFilterList /> */
function ProjectCardSkeleton() {
  return (
    <div className="p-6 rounded-3xl glass-panel flex flex-col justify-between relative overflow-hidden w-full shimmer-card">
      <div className="space-y-4">
        {/* Thumbnail */}
        <Skeleton className="aspect-video rounded-2xl" />

        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-[19.5px] w-[107px] rounded-md" />
          </div>
          <SkeletonText size="base" lineClassName="h-[22px]" className="w-3/4" />
          <SkeletonLines lines={3} size="xs" lastLineWidth="w-4/5" />
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10 mt-4">
        <SkeletonText size="xs" className="w-[116px]" />
      </div>
    </div>
  )
}

/** Category tab content: icon + label (same box as the real tab button) */
function CategoryTabContent({ labelWidth }: { labelWidth: string }) {
  return (
    <>
      <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md shrink-0" />
      <SkeletonText size="2xs" lineClassName="sm:h-4 md:h-5" className={labelWidth} />
    </>
  )
}

export default function ProjectsLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <SkeletonText size="4xl" lineClassName="h-8 md:h-10" className="w-[204px] h-5 md:w-[306px] md:h-7" />
        <SkeletonLines lines={2} size="sm" lastLineWidth="w-1/4" className="sm:hidden" />
        <SkeletonText size="sm" lineClassName="hidden sm:flex" className="w-[432px] max-w-full" />
      </div>

      <div className="space-y-8">
        {/* Top Level Category Tabs */}
        <div className="flex justify-center px-2">
          <div className="flex p-1 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-md w-full relative">
            <div className="flex-1 py-2 sm:py-2.5 rounded-xl relative flex items-center justify-center gap-1 sm:gap-1.5">
              {/* Active tab pill */}
              <div className="absolute inset-0">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
              <span className="invisible flex items-center gap-1 sm:gap-1.5">
                <CategoryTabContent labelWidth="w-[68px] sm:w-[81px] md:w-[95px]" />
              </span>
            </div>
            <div className="flex-1 py-2 sm:py-2.5 rounded-xl relative flex items-center justify-center gap-1 sm:gap-1.5">
              <CategoryTabContent labelWidth="w-[63px] sm:w-[75px] md:w-[88px]" />
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-3 relative z-30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:max-w-md flex gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Skeleton className="w-4 h-4 rounded-md" />
                </div>
                <div className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-white/25">
                  <SkeletonText size="xs" className="w-28" />
                </div>
              </div>

              {/* Filter toggle */}
              <div className="p-2 rounded-xl border bg-white/5 border-slate-300 dark:border-slate-800/10 flex items-center gap-1.5 shrink-0">
                <Skeleton className="w-4 h-4 rounded-md" />
                <SkeletonText size="xs" className="w-[38px]" />
              </div>
            </div>

            {/* Sort selector & counter */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-black/80 border border-slate-300 dark:border-slate-700/60 shadow-2xs">
                <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
                <SkeletonText size="xs" className="w-[27px]" />
                <SkeletonText size="xs" className="w-[80.5px]" />
                <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
              </div>
              <SkeletonText size="xs" className="w-28" />
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="w-full !-mt-4">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
