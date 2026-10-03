import * as React from 'react'
import { Skeleton, SkeletonLines, SkeletonText } from '@/components/ui/skeleton'

/** Mirrors <FeaturedProjectCard /> */
function FeaturedProjectCardSkeleton() {
  return (
    <div className="p-6 rounded-3xl glass-panel flex flex-col justify-between relative overflow-hidden shimmer-card">
      <div className="space-y-4">
        {/* Thumbnail */}
        <Skeleton className="aspect-video rounded-2xl" />

        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-[19.5px] w-[159px] rounded-md" />
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

/** Bar widths for the skill pills (3 rows, like <SkillsMarquee />) */
const SKILL_ROWS = [
  ['w-12', 'w-20', 'w-14', 'w-24', 'w-10', 'w-16', 'w-20', 'w-12', 'w-24', 'w-14', 'w-16', 'w-10'],
  ['w-20', 'w-10', 'w-16', 'w-12', 'w-24', 'w-14', 'w-10', 'w-20', 'w-16', 'w-12', 'w-24', 'w-14'],
  ['w-14', 'w-24', 'w-12', 'w-16', 'w-10', 'w-20', 'w-14', 'w-24', 'w-12', 'w-16', 'w-20', 'w-10'],
]

export default function RootLoading() {
  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SkeletonText size="2xl" className="w-28" />
          <div className="shrink-0">
            <Skeleton className="h-[26px] w-[250px] rounded-full" />
          </div>
        </div>

        <div className="relative p-6 md:p-10 rounded-3xl glass-panel overflow-hidden glow-card-top-left shimmer-card">
          <div className="space-y-4">
            <SkeletonText size="base" className="w-[246px] max-w-full" />

            {/* About me paragraph (line count differs per breakpoint) */}
            <div>
              <SkeletonLines lines={16} size="sm" lineClassName="h-[22.75px]" lastLineWidth="w-[68%]" className="md:hidden" />
              <SkeletonLines lines={10} size="base" lineClassName="h-[26px]" lastLineWidth="w-[10%]" className="hidden md:block xl:hidden" />
              <SkeletonLines lines={7} size="base" lineClassName="h-[26px]" lastLineWidth="w-[48%]" className="hidden xl:block" />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Skeleton className="h-11 w-[237px] rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROJECTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <SkeletonText size="2xl" className="w-[203px]" />
            {/* Subtitle wraps to 2 lines next to the button on mobile */}
            <div>
              <div className="sm:hidden">
                <SkeletonText size="xs" className="w-[191px]" />
                <SkeletonText size="xs" className="w-[67px]" />
              </div>
              <SkeletonText size="xs" lineClassName="hidden sm:flex" className="w-[262px]" />
            </div>
          </div>
          {/* Button label wraps to 2 lines on mobile */}
          <Skeleton className="h-[50px] w-[140px] sm:h-[34px] sm:w-[153px] rounded-xl shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <FeaturedProjectCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* 3. TECH STACK SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <SkeletonText size="2xl" className="w-[330px] max-w-full" />
          <SkeletonText size="xs" className="w-[252px] max-w-full" />
        </div>
        <div className="flex flex-col gap-3 py-4 overflow-hidden relative w-full">
          {SKILL_ROWS.map((row, r) => (
            <div key={r} className="marquee-container w-full">
              <div className={r === 1 ? 'flex gap-4 -translate-x-16' : 'flex gap-4'}>
                {row.map((width, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card shrink-0">
                    <Skeleton className="w-4.5 h-4.5 rounded-full shrink-0" />
                    <SkeletonText size="xs" className={width} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MOMENT RECAP SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <SkeletonText size="2xl" className="w-[178px]" />
          <SkeletonText size="xs" className="w-[279px] max-w-full" />
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative overflow-hidden py-2 marquee-vertical-container"
          style={{ height: '600px' }}
        >
          {['', 'hidden md:block', 'hidden lg:block'].map((visibility, col) => (
            <div key={col} className={`overflow-hidden relative ${visibility}`} style={{ height: '100%' }}>
              <div className={col === 1 ? 'flex flex-col -translate-y-32' : 'flex flex-col'}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="mb-6 h-[240px] w-full rounded-3xl shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WORK TOGETHER SECTION */}
      <section className="p-6 md:p-10 rounded-3xl glass-panel relative overflow-hidden glow-card-top-left shimmer-card">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-5.5 h-5.5 rounded-md shrink-0" />
            <SkeletonText size="2xl" className="w-[225px]" />
          </div>

          <div>
            <SkeletonLines lines={2} size="sm" lineClassName="h-[22.75px]" lastLineWidth="w-[87%]" className="md:hidden" />
            <SkeletonLines lines={2} size="base" lineClassName="h-[26px]" lastLineWidth="w-[15%]" className="hidden md:block xl:hidden" />
            <SkeletonText size="base" lineClassName="h-[26px] hidden xl:flex" className="w-[734px] max-w-full" />
          </div>

          <div className="pt-2">
            <Skeleton className="h-11 w-[133px] rounded-full" />
          </div>
        </div>
      </section>
    </div>
  )
}
