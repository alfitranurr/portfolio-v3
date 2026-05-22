import { getCertificates } from '@/lib/data-service'
import { CertificatesFilterList } from '@/components/certificates-filter-list'

export const metadata = {
  title: 'Certificates',
  description: 'Hackathon competitions, licenses, professional certifications, and seminar workshops.',
}

export default async function CertificatesPage() {
  const certificates = await getCertificates()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Credentials & Certifications</h1>
        <p className="text-sm text-muted-foreground">Catalog of verified licenses, competition wins, and organization committees</p>
      </div>

      {/* Filter list */}
      <CertificatesFilterList initialCertificates={certificates} />
    </div>
  )
}
