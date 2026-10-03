import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

// Mirrors src/components/admin/ai-settings-client.tsx markup.

const KPI_CARD = 'p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between shimmer-card'

/** Helper text-[10px] leading-normal: 2 lines in the narrow column (mobile & lg+), 1 line at sm–lg */
function HelpText() {
  return (
    <div>
      <SkeletonText size="2xs" className="w-full" />
      <SkeletonText size="2xs" lineClassName="sm:hidden lg:flex" className="w-3/5" />
    </div>
  )
}

/** Label row + range input (inline-block h-1.5 sits in a 17px line box) + help text */
function SliderField({ labelWidth, hintWidth }: { labelWidth: string; hintWidth: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <SkeletonText size="xs" className={labelWidth} />
        <SkeletonText size="2xs" className={hintWidth} />
      </div>
      <div className="h-[17px] pt-[11px]">
        <Skeleton className="w-full h-1.5 rounded-lg" />
      </div>
      <HelpText />
    </div>
  )
}

function LogRowSkeleton() {
  return (
    <div className="rounded-2xl border relative overflow-hidden bg-white/5 border-slate-200/5 dark:border-slate-800/5 shimmer-card">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="w-[106px] h-[19.5px] rounded-md" />
            <Skeleton className="w-[60px] h-[19px] rounded" />
          </div>
          <SkeletonText size="xs" lineClassName="mt-1" className="w-3/4" />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <Skeleton className="w-3.5 h-3.5 rounded" />
            <SkeletonText size="2xs" className="w-[46px]" />
          </div>
          <Skeleton className="w-4 h-4 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default function AdminAISettingsLoading() {
  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Header */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shimmer-card">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-[38px] h-[38px] shrink-0" />
              <SkeletonText size="2xl" lineClassName="sm:h-9" className="w-48 sm:w-60 sm:h-6" />
            </div>
            {/* description: 3 lines on mobile, 2 at sm–xl, 1 at xl+ */}
            <div className="pt-0.5">
              <SkeletonText size="xs" lineClassName="sm:h-5" className="w-full xl:w-[743px] sm:h-3" />
              <SkeletonText size="xs" lineClassName="sm:h-5 xl:hidden" className="w-full sm:w-2/5 sm:h-3" />
              <SkeletonText size="xs" lineClassName="sm:hidden" className="w-2/5" />
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['w-24', 'w-24'],
            ['w-24', 'w-32'],
            ['w-32', 'w-28'],
            ['w-28', 'w-28'],
          ].map(([label, sub], i) => (
            <div key={i} className={KPI_CARD}>
              <div className="flex justify-between items-start">
                <SkeletonText size="xs" className={label} />
                <Skeleton className="w-8 h-8 shrink-0" />
              </div>
              <div className="mt-4">
                <SkeletonText size="2xl" className="w-20" />
                <SkeletonText size="2xs" lineClassName="mt-0.5" className={sub} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Config Form & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-6 shimmer-card">
              <div className="flex items-center gap-2 border-b border-slate-200/10 dark:border-slate-800/10 pb-3">
                <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                <SkeletonText size="lg" className="w-28" />
              </div>

              <div className="space-y-5">
                {/* Model selection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-3.5 h-3.5 rounded" />
                    <SkeletonText size="xs" className="w-24" />
                  </div>
                  <Skeleton className="w-full h-[41px]" />
                  <HelpText />
                </div>

                <SliderField labelWidth="w-28" hintWidth="w-12" />
                <SliderField labelWidth="w-44" hintWidth="w-10" />

                {/* Google Search Grounding toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-slate-200/5">
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="w-3.5 h-3.5 rounded" />
                      <SkeletonText size="xs" className="w-28" />
                    </div>
                    {/* text-[9px] leading-normal: wraps to 2 lines in the narrow lg+ column */}
                    <div>
                      <SkeletonText size="3xs" className="w-40" />
                      <SkeletonText size="3xs" lineClassName="hidden lg:flex" className="w-10" />
                    </div>
                  </div>
                  <Skeleton className="w-11 h-6 rounded-full shrink-0" />
                </div>

                {/* Submit Button */}
                <Skeleton className="w-full h-9" />
              </div>
            </div>
          </div>

          {/* Right Side: Usage Logs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                <SkeletonText size="lg" className="w-44" />
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Skeleton className="w-full h-[34px]" />
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <LogRowSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
