import * as React from 'react'
import { HeaderSkeleton, ProjectCardSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function ProjectsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-56 sm:w-80" 
        subtitleWidth="w-full max-w-md" 
      />

      {/* Main Categories Switcher (Data / Non-Data) */}
      <div className="flex p-1.5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-md gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>

      {/* Search Bar + Filters + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-11 flex-1 rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-32 rounded-2xl" />
          <Skeleton className="h-11 w-36 rounded-2xl" />
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  )
}
