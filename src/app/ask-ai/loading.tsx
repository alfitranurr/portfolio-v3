import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AskAILoading() {
  return (
    <div className="flex flex-col h-[calc(100dvh-7.8rem)] sm:h-[calc(100dvh-8.2rem)] lg:h-[calc(100vh-4.8rem)] space-y-3 sm:space-y-4 w-full animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-1">
          <Skeleton className="h-8 sm:h-10 w-28 sm:w-48 rounded-lg" />
          <Skeleton className="h-4 w-48 sm:w-80 rounded hidden sm:block" />
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80">
          <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-2.5 w-16 rounded" />
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
