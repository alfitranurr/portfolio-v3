import * as React from 'react'
import { HeaderSkeleton, FilterTabsSkeleton, ExperienceCardSkeleton } from '@/components/ui/skeleton'

export default function ExperienceLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-44 sm:w-60" 
        subtitleWidth="w-full max-w-sm" 
      />

      {/* Tabs */}
      <FilterTabsSkeleton count={3} />

      {/* Experience list */}
      <div className="space-y-6">
        <ExperienceCardSkeleton />
        <ExperienceCardSkeleton />
        <ExperienceCardSkeleton />
      </div>
    </div>
  )
}
