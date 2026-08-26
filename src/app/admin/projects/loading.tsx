import * as React from 'react'
import { HeaderSkeleton, AdminTableSkeleton } from '@/components/ui/skeleton'

export default function AdminProjectsLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <HeaderSkeleton titleWidth="w-52 sm:w-72" subtitleWidth="w-64 sm:w-96" />
      <AdminTableSkeleton rowCount={6} />
    </div>
  )
}
