import * as React from 'react'
import { HeaderSkeleton, StatCardsSkeleton, ProjectCardSkeleton } from '@/components/ui/skeleton'

export default function RootLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero / Header Skeleton */}
      <HeaderSkeleton titleWidth="w-56 sm:w-80" subtitleWidth="w-full max-w-lg" />

      {/* Metrics / Highlight stats */}
      <StatCardsSkeleton />

      {/* Featured Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 shimmer-placeholder rounded-md" />
          <div className="h-8 w-24 shimmer-placeholder rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      </div>
    </div>
  )
}
