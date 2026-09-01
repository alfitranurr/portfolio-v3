import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Copy, Edit3, Trash2, Calendar, MapPin, Briefcase } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Experience, CATEGORY_MAP } from './types'

interface ExperienceGridViewProps {
  experiences: Experience[]
  onPreview: (experience: Experience) => void
  onEdit: (experience: Experience) => void
  onDuplicate: (experience: Experience) => void
  onDelete: (id: string) => void
}

export function ExperienceGridView({ experiences, onPreview, onEdit, onDuplicate, onDelete }: ExperienceGridViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {experiences.map((exp) => (
          <motion.div
            layout
            key={exp.id}
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
                {exp.logo_url ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-1 shadow-xs">
                    <BlurImage
                      src={getDirectImageUrl(exp.logo_url, 150)}
                      alt={exp.company}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {exp.role}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                    {exp.company}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                  {CATEGORY_MAP[exp.category || 'professional']}
                </span>
                {exp.is_current && (
                  <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold">
                    Current
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : 'N/A'}
                  </span>
                </div>
                {exp.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{exp.location}</span>
                  </div>
                )}
              </div>

              {exp.description && exp.description.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <ul className="list-disc list-inside space-y-1">
                    {exp.description.slice(0, 2).map((desc, idx) => (
                      <li key={idx} className="line-clamp-1">{desc}</li>
                    ))}
                  </ul>
                  {exp.description.length > 2 && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      +{exp.description.length - 2} more...
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
              <button
                onClick={() => onPreview(exp)}
                title="View Details"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDuplicate(exp)}
                title="Duplicate Experience"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit(exp)}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(exp.id)}
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
