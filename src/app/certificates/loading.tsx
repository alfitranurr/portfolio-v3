import * as React from 'react'
import { HeaderSkeleton, FilterTabsSkeleton, CertificateCardSkeleton } from '@/components/ui/skeleton'

export default function CertificatesLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <HeaderSkeleton 
        titleWidth="w-64 sm:w-96" 
        subtitleWidth="w-full max-w-md" 
      />

      {/* Tabs */}
      <FilterTabsSkeleton count={5} />

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
