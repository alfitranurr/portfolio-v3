import * as React from 'react'
import { HeaderSkeleton, EducationCardSkeleton } from '@/components/ui/skeleton'

export default function EducationLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-56 sm:w-72" 
        subtitleWidth="w-full max-w-sm" 
      />

      {/* Education Timeline */}
      <div className="space-y-6 py-2">
        <EducationCardSkeleton />
        <EducationCardSkeleton />
      </div>
    </div>
  )
}
