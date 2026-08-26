import * as React from 'react'
import { HeaderSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function AdminProfileLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <HeaderSkeleton titleWidth="w-52 sm:w-72" subtitleWidth="w-64 sm:w-96" />

      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-6 shimmer-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-36 w-36 rounded-full mx-auto md:mx-0" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
