import * as React from 'react'
import { AdminHeaderSkeleton, AdminControlsSkeleton, AdminTableSkeleton } from '@/components/ui/skeleton'

export default function AdminProjectsLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <AdminHeaderSkeleton 
        titleWidth="w-52 sm:w-64" 
        subtitleWidth="w-72 sm:w-[420px]" 
        buttonWidth="w-32" 
      />

      <AdminControlsSkeleton tabCount={4} hasSearch hasSort />

      <AdminTableSkeleton rowCount={6} />
    </div>
  )
}
