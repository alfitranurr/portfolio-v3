import * as React from 'react'
import { X, Coffee, FileCode, ExternalLink, Edit3 } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Project, SUBCATEGORY_MAP } from './types'

interface ProjectPreviewModalProps {
  project: Project | null
  onClose: () => void
  onEdit: (project: Project) => void
}

export function ProjectPreviewModal({ project, onClose, onEdit }: ProjectPreviewModalProps) {
  if (!project) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {project.cover_image ? (
              <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                <BlurImage src={getDirectImageUrl(project.cover_image, 200)} alt={project.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Coffee className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-foreground leading-snug">{project.title}</h3>
              <p className="text-xs font-semibold text-sky-400">{SUBCATEGORY_MAP[project.sub_category] || project.sub_category}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
          <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">{project.category === 'data' ? 'Data Science' : 'General Dev'}</span>
          {project.is_featured && <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary font-bold uppercase">Featured</span>}
          {project.pinned_order !== null && project.pinned_order !== undefined && project.pinned_order > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">Pin: #{project.pinned_order}</span>
          )}
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 text-xs text-slate-300">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
          <p className="leading-relaxed">{project.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-all" title="GitHub">
                <FileCode className="w-4 h-4" />
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-all" title="Live Demo">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <button
            onClick={() => {
              onClose()
              onEdit(project)
            }}
            className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Project</span>
          </button>
        </div>
      </div>
    </div>
  )
}
