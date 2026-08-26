import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AskAILoading() {
  return (
    <div className="flex flex-col h-[calc(100dvh-6.2rem)] sm:h-[calc(100vh-7rem)] lg:h-[calc(100vh-4.5rem)] space-y-2 sm:space-y-3 pb-1 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-1">
          <Skeleton className="h-6 sm:h-8 w-28 sm:w-36 rounded-lg" />
          <Skeleton className="h-3 w-40 sm:w-64 rounded hidden sm:block" />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80">
          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 sm:w-20 rounded" />
            <Skeleton className="h-2 w-12 sm:w-16 rounded" />
          </div>
        </div>
      </div>

      {/* Terminal / Chat window mockup skeleton */}
      <div className="flex-1 min-h-0 rounded-2xl sm:rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-3 sm:p-5 flex flex-col justify-between shimmer-card">
        {/* Messages placeholder */}
        <div className="space-y-3 max-w-xl">
          <div className="flex gap-2.5 items-start">
            <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-36 rounded" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Input area mockup */}
        <div className="pt-3 border-t border-slate-200/10 dark:border-slate-800/10">
          <Skeleton className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
