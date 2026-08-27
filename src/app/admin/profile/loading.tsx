import * as React from 'react'
import { AdminHeaderSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function AdminProfileLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <AdminHeaderSkeleton 
        titleWidth="w-56 sm:w-72" 
        subtitleWidth="w-72 sm:w-[420px]" 
        buttonWidth="w-36" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Personal Information */}
        <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-5 shimmer-card">
          <div className="space-y-1.5 pb-2 border-b border-slate-200/10 dark:border-slate-800/10">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Right Column: Avatar, Logo & Socials */}
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-5 shimmer-card">
            <div className="space-y-1.5 pb-2 border-b border-slate-200/10 dark:border-slate-800/10">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-3.5 w-56 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-2 text-center flex flex-col items-center">
                <Skeleton className="w-28 h-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              <div className="space-y-2 text-center flex flex-col items-center">
                <Skeleton className="w-28 h-28 rounded-2xl" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 shimmer-card">
            <div className="space-y-1.5 pb-2 border-b border-slate-200/10 dark:border-slate-800/10">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-52 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
