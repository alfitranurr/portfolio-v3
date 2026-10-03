import * as React from 'react'
import { Skeleton, SkeletonLines, SkeletonText } from '@/components/ui/skeleton'

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-8 w-full">
      {/* Back button */}
      <div className="inline-flex items-center gap-2">
        <Skeleton className="w-4 h-4 rounded-md" />
        <SkeletonText size="xs" className="w-[97px]" />
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-[25px] w-[205px] rounded-full" />
            <span className="flex items-center gap-1.5 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-3 py-1 rounded-full">
              <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
              <SkeletonText size="xs" className="w-[61px]" />
            </span>
          </div>
          {/* Title: text-2xl md:text-4xl leading-tight (usually 3 lines on mobile, 2 on desktop) */}
          <div>
            <SkeletonText size="4xl" lineClassName="h-[30px] md:h-[45px]" className="w-full h-5 md:h-7" />
            <SkeletonText size="4xl" lineClassName="h-[30px] md:h-[45px]" className="w-full md:w-2/5 h-5 md:h-7" />
            <SkeletonText size="2xl" lineClassName="h-[30px] md:hidden" className="w-1/3" />
          </div>
        </div>

        {/* Description: text-sm md:text-base leading-relaxed */}
        <div>
          <SkeletonLines lines={16} size="sm" lineClassName="h-[22.75px]" lastLineWidth="w-2/5" className="md:hidden" />
          <SkeletonLines lines={7} size="base" lineClassName="h-[26px]" lastLineWidth="w-3/5" className="hidden md:block" />
        </div>

        {/* Buttons Panel */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Skeleton className="h-[38px] w-[156px] rounded-xl" />
          <Skeleton className="h-[38px] w-[153px] rounded-xl" />
        </div>
      </div>

      {/* Main Cover Banner */}
      <Skeleton className="aspect-video w-full rounded-3xl" />

      {/* Case Study Markdown Content (most projects render a single placeholder paragraph) */}
      <div className="p-6 md:p-10 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 shimmer-card">
        <div className="mb-4">
          <SkeletonText size="sm" lineClassName="h-[22.75px] md:h-[26px]" className="w-[306px] md:w-[350px] max-w-full md:h-3.5" />
        </div>
      </div>
    </div>
  )
}
