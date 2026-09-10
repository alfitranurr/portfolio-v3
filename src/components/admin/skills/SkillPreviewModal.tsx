import * as React from 'react'
import { createPortal } from 'react-dom'
import { X, Edit3, Award } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Skill } from './types'

interface SkillPreviewModalProps {
  skill: Skill | null
  onClose: () => void
  onEdit: (skill: Skill) => void
}

export function SkillPreviewModal({ skill, onClose, onEdit }: SkillPreviewModalProps) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!skill || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 overflow-hidden">
              {skill.logo_url ? (
                <BlurImage src={getDirectImageUrl(skill.logo_url, 100)} alt={skill.name} lowQuality sizes="64px" className="w-12 h-12 object-contain" />
              ) : (
                <Award className="w-8 h-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground leading-snug">{skill.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {skill.proficiency !== null && skill.proficiency !== undefined && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-y border-slate-200 dark:border-slate-800 py-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 font-bold text-foreground">
              Proficiency: {skill.proficiency}%
            </span>
          </div>
        )}

        {skill.description && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 text-xs text-muted-foreground">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider block">Description</span>
            <p className="leading-relaxed">{skill.description}</p>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onClose()
              onEdit(skill)
            }}
            className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Skill</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
