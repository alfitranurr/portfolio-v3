import * as React from 'react'
import {
  HeroAboutSkeleton,
  ProjectCardSkeleton,
  MarqueeSkeleton,
  PhotosMarqueeSkeleton,
  WorkTogetherSkeleton,
  Skeleton,
} from '@/components/ui/skeleton'

export default function RootLoading() {
  return (
    <div className="space-y-16 animate-in fade-in duration-200">
      {/* 1. HERO / ABOUT ME SECTION */}
      <HeroAboutSkeleton />

      {/* 2. FEATURED PROJECTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
          <Skeleton className="h-4 w-28 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      </section>

      {/* 3. TECH STACK SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-60 rounded-md" />
          <Skeleton className="h-3.5 w-72 rounded" />
        </div>
        <MarqueeSkeleton count={8} />
      </section>

      {/* 4. MOMENT RECAP SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-44 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>
        <PhotosMarqueeSkeleton count={5} />
      </section>

      {/* 5. WORK TOGETHER SECTION */}
      <WorkTogetherSkeleton />
    </div>
  )
}
