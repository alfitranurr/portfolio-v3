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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function CertificateGridView({ certificates, onPreview, onEdit, onDuplicate, onDelete }: CertificateGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="sync">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{
              opacity: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }
            }}
            className="p-4 rounded-2xl glass-panel border border-slate-200/60 dark:border-slate-800/60 space-y-3 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col group transform-gpu"
          >
            {/* Thumbnail */}
            {cert.image_url ? (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
                <BlurImage
                  src={getDirectImageUrl(cert.image_url, 400)}
                  alt=""
                  lowQuality
                  initialBlur="blur-xl opacity-0"
                  initialScale="scale-110"
                  loadedBlur="blur-xl opacity-30"
                  loadedScale="scale-110"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />
                <BlurImage
                  src={getDirectImageUrl(cert.image_url, 400)}
                  alt={cert.title}
                  priority={index < 3}
                  loading={index >= 3 ? "eager" : undefined}
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Award className="w-12 h-12 text-primary/30" />
              </div>
            )}

            {/* Title + Issuer */}
            <div>
              <h3 className="font-black text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {cert.title}
              </h3>
              <p className="text-xs font-semibold text-muted-foreground mt-1">
                {cert.issuer}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-muted-foreground text-[10px] font-bold">
                {CATEGORY_MAP[cert.category]}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>{formatDate(cert.issue_date)}</span>
              </div>
              {cert.credential_id && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-muted-foreground text-[10px] font-mono">
                  {cert.credential_id}
                </span>
              )}
            </div>

            {/* Footer: Links + Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
              <div className="flex items-center gap-1.5">
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all cursor-pointer" title="View Credential">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => onPreview(cert)} title="View Details" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-all cursor-pointer">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onDuplicate(cert)} title="Duplicate" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 transition-all cursor-pointer">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(cert)} title="Edit" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(cert.id)} title="Delete" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
