import * as React from 'react'
import { Skeleton, SkeletonLines, SkeletonText } from '@/components/ui/skeleton'

/** Mirrors a certificate card in <CertificatesFilterList /> */
function CertificateCardSkeleton() {
  return (
    <div className="p-6 rounded-3xl glass-panel border border-slate-300/80 dark:border-slate-800/30 shadow-xs flex flex-col justify-between relative overflow-hidden w-full shimmer-card">
      <div className="space-y-4">
        {/* Category icon header */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
          <Skeleton className="h-[23.5px] w-[149px] rounded-lg" />
        </div>

        {/* Image */}
        <Skeleton className="aspect-video rounded-2xl" />

        {/* Title & Info */}
        <div className="space-y-2.5">
          {/* Title: usually 1 line on the full-width mobile card, 2 lines in the grid */}
          <div>
            <SkeletonText size="xs" lineClassName="h-[16.5px] sm:h-[17.875px]" className="w-4/5 md:w-full" />
            <SkeletonText size="xs" lineClassName="h-[16.5px] sm:h-[17.875px] hidden md:flex" className="w-2/5" />
          </div>

          <div className="border-t border-slate-200/10 dark:border-slate-800/20 pt-2.5 space-y-2">
            <div className="flex flex-col">
              <SkeletonText size="3xs" lineClassName="h-3" className="w-12 h-1.5" />
              <SkeletonText size="2xs" lineClassName="h-[16.5px] mt-0.5" className="w-40 h-2.5" />
            </div>
            <div className="flex flex-col border-t border-slate-200/10 dark:border-slate-800/30 pt-2 mt-2">
              <SkeletonText size="3xs" lineClassName="h-3" className="w-16 h-1.5" />
              <SkeletonText size="3xs" lineClassName="h-[14.25px] mt-0.5" className="w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer details */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-200/10 dark:border-slate-800/10 mt-3">
        <div className="flex items-center gap-1">
          <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
          <SkeletonText size="2xs" className="w-[41px]" />
        </div>
        <div className="ml-auto inline-flex items-center gap-1">
          <SkeletonText size="2xs" lineClassName="h-[16.5px]" className="w-[90px] h-2.5" />
          <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
        </div>
      </div>
    </div>
  )
}

export default function CertificatesLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <SkeletonText size="4xl" lineClassName="h-8 md:h-10" className="w-[334px] max-w-full h-5 md:w-[500px] md:h-7" />
        <SkeletonLines lines={2} size="sm" lastLineWidth="w-[35%]" className="sm:hidden" />
        <SkeletonText size="sm" lineClassName="hidden sm:flex" className="w-[485px] max-w-full" />
      </div>

      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-3 relative z-30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:max-w-md flex gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Skeleton className="w-4 h-4 rounded-md" />
                </div>
                <div className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-white/25">
                  <SkeletonText size="xs" className="w-32" />
                </div>
              </div>

              {/* Filter toggle */}
              <div className="px-3 py-2 rounded-xl border bg-white/5 border-slate-300 dark:border-slate-800/20 flex items-center gap-1.5 shrink-0">
                <Skeleton className="w-4 h-4 rounded-md" />
                <SkeletonText size="xs" className="w-[38px]" />
              </div>
            </div>

            {/* Sort selector & counter */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-black/80 border border-slate-300 dark:border-slate-700/60 shadow-2xs">
                <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
                <SkeletonText size="xs" className="w-[27px]" />
                <SkeletonText size="xs" className="w-[73px]" />
                <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
              </div>
              <SkeletonText size="xs" className="w-[114px]" />
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="w-full">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <CertificateCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
