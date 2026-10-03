import * as React from 'react'
import { AdminHeaderSkeleton, AdminControlsSkeleton, AdminTableSkeleton } from '@/components/ui/skeleton'

export default function AdminCertificatesLoading() {
  return (
    <div className="space-y-8 w-full">
      <AdminHeaderSkeleton
        titleWidth="w-56 sm:w-72"
        subtitleWidth="w-72 sm:w-[420px]"
        buttonWidth="w-36"
      />

      <AdminControlsSkeleton tabCount={5} hasSearch hasSort />

      <AdminTableSkeleton rowCount={5} />
    </div>
  )
}
