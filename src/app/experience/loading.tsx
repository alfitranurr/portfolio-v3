import * as React from 'react'
import { HeaderSkeleton, ExperienceCardSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function ExperienceLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-44 sm:w-60" 
        subtitleWidth="w-full max-w-sm" 
      />

      {/* 2 Category Switcher (Professional / Leadership) */}
      <div className="flex p-1.5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-md gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>

      {/* Experience list */}
      <div className="space-y-6">
        <ExperienceCardSkeleton />
        <ExperienceCardSkeleton />
        <ExperienceCardSkeleton />
      </div>
    </div>
  )
}
