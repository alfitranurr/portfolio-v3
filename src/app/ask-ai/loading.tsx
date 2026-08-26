import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AskAILoading() {
  return (
    <div className="space-y-3 sm:space-y-6 h-[calc(100dvh-6.8rem)] sm:h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-4.5rem)] flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-1">
          <Skeleton className="h-7 sm:h-10 w-36 sm:w-48 rounded-lg" />
          <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-80 rounded" />
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80">
          <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-2.5 w-16 rounded" />
          </div>
        </div>
      </div>

      {/* Terminal / Chat window mockup skeleton */}
      <div className="flex-grow min-h-0 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-4 md:p-6 flex flex-col justify-between shimmer-card">
        {/* Messages placeholder */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex gap-3 items-start">
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Input area mockup */}
        <div className="pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
