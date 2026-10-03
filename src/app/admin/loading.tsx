import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

// Mirrors src/components/admin/messages/index.tsx (MessagesList) markup.

const STAT_CARD = 'p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-2 shimmer-card'

function MessageRowSkeleton() {
  return (
    <div className="rounded-2xl border glass-panel border-slate-200/10 dark:border-slate-800/10 bg-white/2 dark:bg-slate-900/20 shimmer-card">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="min-w-0 flex-1">
              {/* name + email (wraps to 2 rows on narrow screens, like the real row) */}
              <div className="flex items-center gap-2 flex-wrap">
                <SkeletonText size="xs" className="w-12" />
                <SkeletonText size="2xs" className="w-32" />
              </div>
              <SkeletonText size="xs" lineClassName="mt-1" className="w-20" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SkeletonText size="2xs" className="w-[132px]" />
            <Skeleton className="w-[26px] h-[26px] rounded-lg" />
            <Skeleton className="w-4 h-4 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardLoading() {
  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Header */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 relative overflow-hidden shadow-sm shimmer-card">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-[38px] h-[38px] shrink-0" />
              <div className="min-w-0">
                <SkeletonText size="2xl" lineClassName="sm:h-9" className="w-40 sm:w-[354px] sm:h-6" />
                {/* the text-2xl title wraps to 2 lines below ~414px */}
                <SkeletonText size="2xl" lineClassName="min-[414px]:hidden" className="w-32" />
              </div>
            </div>
            <div className="pt-0.5">
              <SkeletonText size="xs" lineClassName="sm:h-5" className="w-full xl:w-[682px] sm:h-3" />
              <SkeletonText size="xs" lineClassName="sm:h-5 xl:hidden" className="w-3/5 sm:h-3" />
            </div>
          </div>
        </div>

        {/* Toolbar: Reset Cache / Clean Storage / Refresh (left), Reset Stats + clock (right) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="w-[131px] h-[46px] rounded-2xl" />
            <Skeleton className="w-[142px] h-[46px] rounded-2xl" />
            <Skeleton className="w-[46px] h-[46px] rounded-2xl" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="w-[123px] h-[46px] rounded-2xl" />
            {/* RealTimeClock: py-2.5 + (time xs/md:sm + date 9px leading-tight) + border */}
            <Skeleton className="w-[227px] h-[51.25px] md:h-[55.25px] rounded-2xl shrink-0" />
          </div>
        </div>

        {/* Visitor Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['w-16', 'w-24', 'w-24', 'w-24'].map((w, i) => (
              <div key={i} className={STAT_CARD}>
                <SkeletonText size="2xl" className="w-14" />
                <SkeletonText size="xs" className={w} />
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Traffic Chart */}
        <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-4 md:p-6 shimmer-card">
          <SkeletonText size="sm" lineClassName="mb-4" className="w-52" />
          <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded-md" />
                  <SkeletonText size="base" className="w-44" />
                </div>
                <SkeletonText size="xs" lineClassName="mt-1" className="w-64 sm:w-80" />
                <SkeletonText size="xs" lineClassName="sm:hidden" className="w-24" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Skeleton className="w-3.5 h-3.5 rounded" />
                  <SkeletonText size="xs" className="w-[61px]" />
                </div>
                <Skeleton className="w-[76px] h-[33px] rounded-xl" />
              </div>
            </div>

            {/* Stats Summary Panel (labels are inline → 24px line boxes; they wrap on mobile) */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 shadow-2xs">
              {[3, 4].map((mobileLines, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 shrink-0" />
                  <div>
                    <SkeletonText size="2xs" lineClassName="h-6" className="w-12 sm:w-28" />
                    {Array.from({ length: mobileLines - 1 }).map((_, j) => (
                      <SkeletonText key={j} size="2xs" lineClassName="h-6 sm:hidden" className="w-12" />
                    ))}
                    <SkeletonText size="lg" lineClassName="mt-0.5" className="w-12" />
                  </div>
                </div>
              ))}
            </div>

            <div className="relative w-full">
              <Skeleton className="w-full h-[220px] sm:h-[300px] rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Portfolio Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['w-16', 'w-20', 'w-20', 'w-20'].map((w, i) => (
            <div key={i} className={`${STAT_CARD} text-center`}>
              <SkeletonText size="2xl" lineClassName="justify-center" className="w-10" />
              <SkeletonText size="xs" lineClassName="justify-center" className={w} />
            </div>
          ))}
        </div>

        {/* Messages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-md shrink-0" />
              <SkeletonText size="xl" className="w-[202px]" />
              <Skeleton className="w-[60px] h-[19px] rounded-full shrink-0" />
            </div>

            <div className="relative flex-1 max-w-md">
              <Skeleton className="w-full h-[38px]" />
            </div>
          </div>

          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <MessageRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
