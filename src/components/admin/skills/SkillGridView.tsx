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
  onDelete: (id: string) => void
}

export function SkillGridView({ skills, onPreview, onEdit, onDelete }: SkillGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence mode="sync">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{
              opacity: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }
            }}
            className="p-4 rounded-2xl glass-panel border border-slate-200/60 dark:border-slate-800/60 space-y-3 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group transform-gpu"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 relative">
              {skill.logo_url ? (
                <BlurImage
                  src={getDirectImageUrl(skill.logo_url, 100)}
                  alt={skill.name}
                  lowQuality
                  sizes="64px"
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Award className="w-8 h-8 text-muted-foreground/30" />
              )}
            </div>

            <div className="space-y-1.5 w-full">
              <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
                {skill.name}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground">
                {CATEGORY_MAP[skill.category]}
              </p>
              {skill.proficiency !== null && skill.proficiency !== undefined && (
                <div className="w-full max-w-[120px] h-2 bg-slate-200 dark:bg-slate-800/60 rounded-full overflow-hidden mx-auto">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(skill.proficiency, 100)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 w-full mt-auto">
              <button onClick={() => onPreview(skill)} title="View Details" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-all cursor-pointer">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => onEdit(skill)} title="Edit Skill" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(skill.id)} title="Delete Skill" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
