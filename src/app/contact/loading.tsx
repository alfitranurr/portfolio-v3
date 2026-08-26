import * as React from 'react'
import { HeaderSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function ContactLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-48 sm:w-64" 
        subtitleWidth="w-full max-w-sm" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Socials */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 shimmer-card">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-4 w-full rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3.5 p-3 rounded-2xl glass-card border border-slate-200/10 dark:border-slate-800/10">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-5 shimmer-card">
          <div className="space-y-2">
            <Skeleton className="h-6 w-52 rounded-md" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
