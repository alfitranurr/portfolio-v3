import * as React from 'react'
import { CertificatesCrud } from '@/components/admin/certificates-crud'
import { getCertificates } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminCertificatesPage() {
  const certificates = await getCertificates()

  // Format array to match components expects
  const formattedCertificates = certificates.map((c: any) => ({
    ...c,
    category: c.category as any
  }))

  return (
    <div className="w-full">
      <CertificatesCrud initialCertificates={formattedCertificates} />
    </div>
  )
}
