import * as React from 'react'
import { HeaderSkeleton, FilterTabsSkeleton, ProjectCardSkeleton } from '@/components/ui/skeleton'

export default function ProjectsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-56 sm:w-80" 
        subtitleWidth="w-full max-w-md" 
      />

      {/* Categories & Search Bar skeleton */}
      <div className="space-y-4">
        <FilterTabsSkeleton count={4} />
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
