import * as React from 'react'
import { HeaderSkeleton, FilterTabsSkeleton, CertificateCardSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function CertificatesLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-64 sm:w-96" 
        subtitleWidth="w-full max-w-md" 
      />

      {/* Filter Tabs */}
      <FilterTabsSkeleton count={5} />

      {/* Search Bar + Filters + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-11 flex-1 rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-32 rounded-2xl" />
          <Skeleton className="h-11 w-36 rounded-2xl" />
        </div>
      </div>

      {/* Grid of Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CertificateCardSkeleton />
        <CertificateCardSkeleton />
        <CertificateCardSkeleton />
        <CertificateCardSkeleton />
        <CertificateCardSkeleton />
        <CertificateCardSkeleton />
      </div>
    </div>
  )
}
