import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

// Mirrors src/components/admin/profile-form.tsx markup.

const CARD = 'p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 shimmer-card'

/** Label (inline → 24px line box, no space-y gap) + input py-2.5 text-sm (42px) */
function InputField({ labelWidth }: { labelWidth: string }) {
  return (
    <div>
      <SkeletonText size="xs" lineClassName="h-6" className={labelWidth} />
      <Skeleton className="w-full h-[42px]" />
    </div>
  )
}

/** Upload/file picker label: py-2.5 + text-xs + border = 38px */
function UploadButton() {
  return <Skeleton className="w-full h-[38px]" />
}

export default function AdminProfileLoading() {
  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Header */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shimmer-card">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-[38px] h-[38px] shrink-0" />
              <SkeletonText size="2xl" lineClassName="sm:h-9" className="w-44 sm:w-56 sm:h-6" />
            </div>
            <div className="pt-0.5">
              <SkeletonText size="xs" lineClassName="sm:h-5" className="w-[300px] sm:w-[380px] xl:w-[657px] sm:h-3" />
              <SkeletonText size="xs" lineClassName="sm:h-5 xl:hidden" className="w-48 sm:h-3" />
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto z-10">
            <Skeleton className="w-full sm:w-[146px] h-9" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & Bio */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${CARD} space-y-4`}>
              <SkeletonText size="sm" lineClassName="mb-2" className="w-36" />
              <InputField labelWidth="w-20" />
              <InputField labelWidth="w-40" />
              {/* textarea rows=10 (222px) + inline-block baseline gap */}
              <div>
                <SkeletonText size="xs" lineClassName="h-6" className="w-36" />
                <div className="h-[229px]">
                  <Skeleton className="w-full h-[222px]" />
                </div>
              </div>
            </div>

            <div className={`${CARD} space-y-4`}>
              <SkeletonText size="sm" lineClassName="mb-2" className="w-36" />
              <InputField labelWidth="w-28" />
              <InputField labelWidth="w-36" />
              <InputField labelWidth="w-52" />
            </div>
          </div>

          {/* Right Column: Files & Uploads */}
          <div className="space-y-6">
            {/* Logo */}
            <div className={`${CARD} space-y-4 flex flex-col items-center`}>
              <SkeletonText size="sm" lineClassName="w-full" className="w-44" />
              <Skeleton className="w-32 h-32 rounded-3xl" />
              <UploadButton />
              <div>
                <SkeletonText size="2xs" lineClassName="justify-center" className="w-56" />
                <SkeletonText size="2xs" lineClassName="justify-center hidden lg:flex" className="w-14" />
              </div>
            </div>

            {/* Avatar */}
            <div className={`${CARD} space-y-4 flex flex-col items-center`}>
              <SkeletonText size="sm" lineClassName="w-full" className="w-32" />
              <Skeleton className="w-32 h-32 rounded-full" />
              <UploadButton />
              <div>
                <SkeletonText size="2xs" lineClassName="justify-center" className="w-56" />
                <SkeletonText size="2xs" lineClassName="justify-center hidden lg:flex xl:hidden" className="w-14" />
              </div>
            </div>

            {/* Resume */}
            <div className={`${CARD} space-y-4`}>
              <SkeletonText size="sm" lineClassName="w-full" className="w-40" />
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 flex items-center gap-3 shadow-2xs">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="min-w-0 flex-1">
                  <SkeletonText size="xs" className="w-40" />
                  <SkeletonText size="2xs" lineClassName="mt-0.5" className="w-32" />
                </div>
              </div>
              <UploadButton />
              <div>
                <SkeletonText size="2xs" lineClassName="justify-center" className="w-60" />
                <SkeletonText size="2xs" lineClassName="justify-center hidden lg:flex" className="w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
