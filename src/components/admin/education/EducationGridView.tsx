import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Copy, Edit3, Trash2, Calendar, MapPin, GraduationCap } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Education } from './types'

interface EducationGridViewProps {
  educations: Education[]
  onPreview: (education: Education) => void
  onEdit: (education: Education) => void
  onDuplicate: (education: Education) => void
  onDelete: (id: string) => void
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function EducationGridView({ educations, onPreview, onEdit, onDuplicate, onDelete }: EducationGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="sync">
        {educations.map((edu, index) => (
          <motion.div
            key={edu.id}
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
            {/* Header: Logo + Title */}
            <div className="flex items-start gap-3">
              {edu.logo_url ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 shrink-0 relative p-1 shadow-xs">
                  <BlurImage
                    src={getDirectImageUrl(edu.logo_url, 150)}
                    alt={edu.institution}
                    lowQuality
                    sizes="48px"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {edu.degree}
                </h3>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                  {edu.institution}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {edu.field_of_study && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-muted-foreground text-[10px] font-bold">
                  {edu.field_of_study}
                </span>
              )}
              {edu.gpa && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-muted-foreground text-[10px] font-bold">
                  GPA: {edu.gpa}
                </span>
              )}
            </div>

            {/* Date + Location */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                </span>
              </div>
              {edu.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{edu.location}</span>
                </div>
              )}
            </div>

            {/* Footer: Actions */}
            <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
              <button onClick={() => onPreview(edu)} title="View Details" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-all cursor-pointer">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => onDuplicate(edu)} title="Duplicate" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 transition-all cursor-pointer">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => onEdit(edu)} title="Edit" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(edu.id)} title="Delete" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
