import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Edit3, Trash2, Award } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Skill, CATEGORY_MAP } from './types'

interface SkillGridViewProps {
  skills: Skill[]
  onPreview: (skill: Skill) => void
  onEdit: (skill: Skill) => void
  onDuplicate: (skill: Skill) => void
  onDelete: (id: string) => void
}

export function SkillGridView({ skills, onPreview, onEdit, onDuplicate, onDelete }: SkillGridViewProps) {
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {skills.map((skill) => (
          <motion.div
            layout
            key={skill.id}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{
              layout: { type: 'spring', stiffness: 220, damping: 24, mass: 0.8 },
              opacity: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
            }}
            className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 hover:border-primary/30 transition-[border-color,box-shadow] duration-300 flex flex-col items-center text-center group transform-gpu"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
              {skill.logo_url ? (
                <BlurImage
                  src={getDirectImageUrl(skill.logo_url, 100)}
                  alt={skill.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Award className="w-10 h-10 text-muted-foreground/30" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
                {skill.name}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground">
                {CATEGORY_MAP[skill.category]}
              </p>
              {skill.proficiency !== null && skill.proficiency !== undefined && (
                <div className="w-16 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(skill.proficiency, 100)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-slate-200/5 dark:border-slate-800/5 w-full">
              <button
                onClick={() => onPreview(skill)}
                title="View Details"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit(skill)}
                title="Edit Skill"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(skill.id)}
                title="Delete Skill"
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer border border-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
