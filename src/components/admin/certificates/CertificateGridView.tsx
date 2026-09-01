import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Copy, Edit3, Trash2, Calendar, ExternalLink, Award } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Certificate, CATEGORY_MAP } from './types'

interface CertificateGridViewProps {
  certificates: Certificate[]
  onPreview: (certificate: Certificate) => void
  onEdit: (certificate: Certificate) => void
  onDuplicate: (certificate: Certificate) => void
  onDelete: (id: string) => void
}

export function CertificateGridView({ certificates, onPreview, onEdit, onDuplicate, onDelete }: CertificateGridViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {certificates.map((cert) => (
          <motion.div
            layout
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{
              layout: { type: 'spring', stiffness: 220, damping: 24, mass: 0.8 },
              opacity: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
            }}
            className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 hover:border-primary/30 transition-[border-color,box-shadow] duration-300 flex flex-col justify-between group transform-gpu"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="space-y-3">
              {cert.image_url ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950/40 border border-slate-200/10 dark:border-slate-800/10">
                  <BlurImage
                    src={getDirectImageUrl(cert.image_url, 400)}
                    alt={cert.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Award className="w-12 h-12 text-primary/30" />
                </div>
              )}

              <div>
                <h3 className="font-black text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {cert.title}
                </h3>
                <p className="text-xs font-semibold text-muted-foreground mt-1">
                  {cert.issuer}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                  {CATEGORY_MAP[cert.category]}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{formatDate(cert.issue_date)}</span>
                </div>
              </div>

              {cert.credential_id && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold">ID:</span> {cert.credential_id}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
              <div className="flex items-center gap-2">
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                    title="View Credential"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onPreview(cert)}
                  title="View Details"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDuplicate(cert)}
                  title="Duplicate Certificate"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEdit(cert)}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(cert.id)}
                  className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
