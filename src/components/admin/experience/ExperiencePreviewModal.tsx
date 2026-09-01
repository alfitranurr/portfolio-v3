import * as React from 'react'
import { X, Briefcase, Calendar, MapPin } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Experience, CATEGORY_MAP } from './types'

interface ExperiencePreviewModalProps {
  experience: Experience | null
  onClose: () => void
  onEdit: (experience: Experience) => void
}

export function ExperiencePreviewModal({ experience, onClose, onEdit }: ExperiencePreviewModalProps) {
  if (!experience) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {experience.logo_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative p-2">
                <BlurImage src={getDirectImageUrl(experience.logo_url, 200)} alt={experience.company} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Briefcase className="w-8 h-8" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-foreground leading-snug">{experience.role}</h3>
              <p className="text-sm font-semibold text-sky-400">{experience.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
          <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">
            {CATEGORY_MAP[experience.category || 'professional']}
          </span>
          {experience.is_current && (
            <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase">
              Current
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {formatDate(experience.start_date)} - {experience.is_current ? 'Present' : experience.end_date ? formatDate(experience.end_date) : 'N/A'}
            </span>
          </div>
          {experience.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{experience.location}</span>
            </div>
          )}
        </div>

        {experience.description && experience.description.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 text-xs text-slate-300">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Job Responsibilities</span>
            <ul className="list-disc list-inside space-y-1.5">
              {experience.description.map((desc, idx) => (
                <li key={idx} className="leading-relaxed">{desc}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onClose()
              onEdit(experience)
            }}
            className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
          >
            <span>Edit Experience</span>
          </button>
        </div>
      </div>
    </div>
  )
}
