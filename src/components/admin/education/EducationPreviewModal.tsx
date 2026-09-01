import * as React from 'react'
import { X, GraduationCap, Calendar, MapPin } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Education } from './types'

interface EducationPreviewModalProps {
  education: Education | null
  onClose: () => void
  onEdit: (education: Education) => void
}

export function EducationPreviewModal({ education, onClose, onEdit }: EducationPreviewModalProps) {
  if (!education) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {education.logo_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative p-1">
                <BlurImage src={getDirectImageUrl(education.logo_url, 200)} alt={education.institution} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground leading-snug">{education.degree}</h3>
              <p className="text-sm font-semibold text-sky-400 line-clamp-1">{education.institution}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
          {education.field_of_study && (
            <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">
              {education.field_of_study}
            </span>
          )}
          {education.gpa && (
            <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">
              GPA: {education.gpa}
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {formatDate(education.start_date)} - {education.end_date ? formatDate(education.end_date) : 'Present'}
            </span>
          </div>
          {education.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{education.location}</span>
            </div>
          )}
        </div>

        {education.description && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 text-xs text-slate-300">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
            <p className="leading-relaxed whitespace-pre-wrap">{education.description}</p>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onClose()
              onEdit(education)
            }}
            className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
          >
            <span>Edit Education</span>
          </button>
        </div>
      </div>
    </div>
  )
}
