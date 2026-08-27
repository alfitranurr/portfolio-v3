import * as React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'shimmer-placeholder rounded-xl select-none pointer-events-none',
        className
      )}
      {...props}
    />
  )
}

export function HeaderSkeleton({
  titleWidth = 'w-48 sm:w-64',
  subtitleWidth = 'w-72 sm:w-96',
}: {
  titleWidth?: string
  subtitleWidth?: string
}) {
  return (
    <div className="space-y-2">
      <Skeleton className={cn('h-8 sm:h-10', titleWidth)} />
      <Skeleton className={cn('h-4', subtitleWidth)} />
    </div>
  )
}

export function FilterTabsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1 pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-20 sm:w-28 rounded-xl" />
      ))}
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 p-5 space-y-4 shimmer-card flex flex-col justify-between h-[390px]">
      <div className="space-y-4">
        {/* Cover image placeholder */}
        <Skeleton className="w-full h-44 rounded-2xl" />
        
        {/* Category badge & date */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-5/6 rounded-md" />

        {/* Description snippet */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
        </div>
      </div>

      {/* Footer buttons / links */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/10 dark:border-slate-800/10">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
    </div>
  )
}

export function ExperienceCardSkeleton() {
  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 space-y-4 shimmer-card">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex gap-4 items-start">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 sm:w-60 rounded-md" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-1.5 shrink-0">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
      </div>
      <div className="space-y-2 pt-2 border-t border-slate-200/10 dark:border-slate-800/10">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-11/12 rounded" />
        <Skeleton className="h-3.5 w-4/5 rounded" />
      </div>
    </div>
  )
}

export function EducationCardSkeleton() {
  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 space-y-4 shimmer-card">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex gap-4 items-start">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 sm:w-64 rounded-md" />
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-2 shrink-0">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
      </div>
      <div className="space-y-1.5 pt-2">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-3/4 rounded" />
      </div>
    </div>
  )
}

export function CertificateCardSkeleton() {
  return (
    <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 p-5 space-y-4 shimmer-card flex flex-col justify-between h-[360px]">
      <div className="space-y-3.5">
        {/* Certificate preview */}
        <Skeleton className="w-full h-40 rounded-2xl" />
        
        {/* Category icon & badge */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-6 w-32 rounded-lg" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-5/6 rounded-md" />
        
        {/* Issuer */}
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>

      {/* Credential link */}
      <div className="pt-2 border-t border-slate-200/10 dark:border-slate-800/10 flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-7 w-20 rounded-xl" />
      </div>
    </div>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 space-y-3 shimmer-card"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function AdminTableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 p-6 space-y-4 shimmer-card">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-2xl glass-card border border-slate-200/10 dark:border-slate-800/10"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 sm:w-56 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HeroAboutSkeleton() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <Skeleton className="h-7 w-48 rounded-full" />
      </div>

      <div className="p-6 md:p-10 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 space-y-4 shimmer-card">
        <Skeleton className="h-5 w-52 rounded-md" />
        <div className="space-y-2 pt-1">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-11/12 rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-12 w-56 rounded-xl" />
        </div>
      </div>
    </section>
  )
}

export function MarqueeSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 shrink-0 shimmer-card"
        >
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}

export function PhotosMarqueeSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-52 sm:w-64 h-64 sm:h-72 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-3 space-y-3 shrink-0 shimmer-card flex flex-col justify-between"
        >
          <Skeleton className="w-full h-44 rounded-2xl" />
          <div className="space-y-1 px-1">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function WorkTogetherSkeleton() {
  return (
    <section className="p-6 md:p-10 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 space-y-4 shimmer-card">
      <div className="flex items-center gap-3">
        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
        <Skeleton className="h-7 w-56 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full max-w-md rounded" />
      <div className="pt-2">
        <Skeleton className="h-12 w-36 rounded-full" />
      </div>
    </section>
  )
}

export function AdminHeaderSkeleton({
  titleWidth = 'w-48 sm:w-64',
  subtitleWidth = 'w-72 sm:w-96',
  hasButton = true,
  buttonWidth = 'w-32',
}: {
  titleWidth?: string
  subtitleWidth?: string
  hasButton?: boolean
  buttonWidth?: string
}) {
  return (
    <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shimmer-card">
      <div className="space-y-1.5 z-10">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <Skeleton className={cn('h-8 sm:h-9', titleWidth)} />
        </div>
        <Skeleton className={cn('h-4', subtitleWidth)} />
      </div>
      {hasButton && (
        <Skeleton className={cn('h-10 rounded-xl shrink-0 self-start sm:self-center z-10', buttonWidth)} />
      )}
    </div>
  )
}

export function AdminControlsSkeleton({
  hasSearch = true,
  tabCount = 3,
  hasSort = true,
}: {
  hasSearch?: boolean
  tabCount?: number
  hasSort?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {hasSearch && (
          <Skeleton className="h-10 w-full sm:max-w-md rounded-xl" />
        )}
        {hasSort && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        )}
      </div>
      {tabCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Array.from({ length: tabCount }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 sm:w-28 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminPhotosGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/20 p-4 space-y-3 shimmer-card flex flex-col justify-between"
        >
          <Skeleton className="w-full h-48 rounded-2xl" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-3/4 rounded" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


