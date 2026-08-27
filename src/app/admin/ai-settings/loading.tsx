import * as React from 'react'
import { AdminHeaderSkeleton, Skeleton, AdminTableSkeleton } from '@/components/ui/skeleton'

export default function AdminAISettingsLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <AdminHeaderSkeleton 
        titleWidth="w-56 sm:w-80" 
        subtitleWidth="w-72 sm:w-[420px]" 
        buttonWidth="w-36" 
      />

      {/* Settings Panel Skeleton */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-6 shimmer-card">
        <div className="space-y-2 pb-2 border-b border-slate-200/10 dark:border-slate-800/10">
          <Skeleton className="h-6 w-44 rounded-md" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      {/* Logs Table Skeleton */}
      <AdminTableSkeleton rowCount={5} />
    </div>
  )
}
