import * as React from 'react'
import { AdminHeaderSkeleton, AdminControlsSkeleton, AdminPhotosGridSkeleton } from '@/components/ui/skeleton'

export default function AdminPhotosLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <AdminHeaderSkeleton 
        titleWidth="w-56 sm:w-72" 
        subtitleWidth="w-72 sm:w-[420px]" 
        buttonWidth="w-36" 
      />

      <AdminControlsSkeleton tabCount={0} hasSearch hasSort={false} />

      <AdminPhotosGridSkeleton count={6} />
    </div>
  )
}
