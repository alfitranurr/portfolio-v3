import * as React from 'react'
import { X, Edit3, Award } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Skill, CATEGORY_MAP } from './types'

interface SkillPreviewModalProps {
  skill: Skill | null
  onClose: () => void
  onEdit: (skill: Skill) => void
}

export function SkillPreviewModal({ skill, onClose, onEdit }: SkillPreviewModalProps) {
  if (!skill) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 overflow-hidden">
              {skill.logo_url ? (
                <BlurImage src={getDirectImageUrl(skill.logo_url, 100)} alt={skill.name} className="w-12 h-12 object-contain" />
              ) : (
                <Award className="w-8 h-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground leading-snug">{skill.name}</h3>
              <p className="text-sm font-semibold text-sky-400">{CATEGORY_MAP[skill.category]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
          <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">
            Category: {CATEGORY_MAP[skill.category]}
          </span>
          {skill.proficiency !== null && skill.proficiency !== undefined && (
            <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">
              Proficiency: {skill.proficiency}%
            </span>
          )}
        </div>

        {skill.description && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 text-xs text-slate-300">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
            <p className="leading-relaxed">{skill.description}</p>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
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
    </div>
  )
}
