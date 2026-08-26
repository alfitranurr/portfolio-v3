import * as React from 'react'
import { HeaderSkeleton, Skeleton, AdminTableSkeleton } from '@/components/ui/skeleton'

export default function AdminAISettingsLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <HeaderSkeleton titleWidth="w-56 sm:w-80" subtitleWidth="w-72 sm:w-96" />

      {/* Settings Panel Skeleton */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-6 shimmer-card">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44 rounded-md" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      {/* Logs Table Skeleton */}
      <AdminTableSkeleton rowCount={5} />
    </div>
  )
}
