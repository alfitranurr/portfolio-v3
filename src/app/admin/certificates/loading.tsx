import * as React from 'react'
import { HeaderSkeleton, AdminTableSkeleton } from '@/components/ui/skeleton'

export default function AdminCertificatesLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200">
      <HeaderSkeleton titleWidth="w-56 sm:w-80" subtitleWidth="w-72 sm:w-96" />
      <AdminTableSkeleton rowCount={5} />
    </div>
  )
}
