import * as React from 'react'
import { X, Award, Calendar, ExternalLink } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Certificate, CATEGORY_MAP } from './types'

interface CertificatePreviewModalProps {
  certificate: Certificate | null
  onClose: () => void
  onEdit: (certificate: Certificate) => void
}

export function CertificatePreviewModal({ certificate, onClose, onEdit }: CertificatePreviewModalProps) {
  if (!certificate) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {certificate.image_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                <BlurImage src={getDirectImageUrl(certificate.image_url, 200)} alt={certificate.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Award className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2">{certificate.title}</h3>
              <p className="text-sm font-semibold text-sky-400">{certificate.issuer}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
          <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">
            {CATEGORY_MAP[certificate.category]}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(certificate.issue_date)}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          {certificate.credential_id && (
            <div>
              <span className="font-bold text-foreground">Credential ID:</span> {certificate.credential_id}
            </div>
          )}
          {certificate.credential_url && (
            <div>
              <a
                href={certificate.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="underline">View Credential</span>
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onClose()
              onEdit(certificate)
            }}
            className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
          >
            <span>Edit Certificate</span>
          </button>
        </div>
      </div>
    </div>
  )
}
