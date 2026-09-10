import * as React from 'react'
import { createPortal } from 'react-dom'
import { X, Award, Calendar, ExternalLink } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Certificate, CATEGORY_MAP } from './types'

interface CertificatePreviewModalProps {
  certificate: Certificate | null
  onClose: () => void
  onEdit: (certificate: Certificate) => void
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function CertificatePreviewModal({ certificate, onClose, onEdit }: CertificatePreviewModalProps) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!certificate || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {certificate.image_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                <BlurImage src={getDirectImageUrl(certificate.image_url, 200)} alt={certificate.title} sizes="64px" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Award className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">{certificate.title}</h3>
              <p className="text-sm font-semibold text-sky-600">{certificate.issuer}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500 border-y border-slate-200 py-3">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 font-bold text-slate-900">
            {CATEGORY_MAP[certificate.category]}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(certificate.issue_date)}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          {certificate.credential_id && (
            <div>
              <span className="font-bold text-slate-900">Credential ID:</span> {certificate.credential_id}
            </div>
          )}
          {certificate.credential_url && (
            <div>
              <a
                href={certificate.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="underline">View Credential</span>
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-200">
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
    </div>,
    document.body
  )
}
