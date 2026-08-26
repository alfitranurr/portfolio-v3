import * as React from 'react'
import { HeaderSkeleton, StatCardsSkeleton, AdminTableSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      {/* Admin Title */}
      <HeaderSkeleton 
        titleWidth="w-56 sm:w-72" 
        subtitleWidth="w-72 sm:w-96" 
      />

      {/* 4 Stat Cards */}
      <StatCardsSkeleton />

      {/* Traffic Analytics Chart Skeleton */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 shimmer-card">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>

      {/* Messages Table Skeleton */}
      <AdminTableSkeleton rowCount={4} />
    </div>
  )
}
