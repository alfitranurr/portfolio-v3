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

export function EducationGridView({ educations, onPreview, onEdit, onDuplicate, onDelete }: EducationGridViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {educations.map((edu) => (
          <motion.div
            layout
            key={edu.id}
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
              <div className="flex items-start gap-3">
                {edu.logo_url ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-1 shadow-xs">
                    <BlurImage
                      src={getDirectImageUrl(edu.logo_url, 150)}
                      alt={edu.institution}
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

              {edu.field_of_study && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold">Field:</span> {edu.field_of_study}
                </p>
              )}

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

              {edu.gpa && (
                <div className="text-xs">
                  <span className="font-bold text-foreground">GPA:</span> <span className="text-muted-foreground">{edu.gpa}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
              <button
                onClick={() => onPreview(edu)}
                title="View Details"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDuplicate(edu)}
                title="Duplicate Education"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit(edu)}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(edu.id)}
                className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
