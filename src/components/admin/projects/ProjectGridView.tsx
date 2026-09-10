import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Copy, Edit3, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Github } from '@/components/icons'
import { Project, SUBCATEGORY_MAP } from './types'

interface ProjectGridViewProps {
  projects: Project[]
  onPreview: (project: Project) => void
  onEdit: (project: Project) => void
  onDuplicate: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectGridView({ projects, onPreview, onEdit, onDuplicate, onDelete }: ProjectGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="sync">
        {projects.map((proj, index) => (
          <motion.div
            key={proj.id}
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
            {/* Header: Title + Featured badge */}
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-black text-sm leading-tight text-foreground flex-1 line-clamp-1">
                {proj.title}
              </h3>
              {proj.is_featured && (
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-black uppercase tracking-wider shrink-0">
                  Featured
                </span>
              )}
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-muted-foreground text-[10px] font-bold">
                {proj.category === 'data' ? 'Data Science' : 'General Dev'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-muted-foreground text-[10px] font-bold">
                {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
              </span>
              {proj.pinned_order !== null && proj.pinned_order !== undefined && proj.pinned_order > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                  Pin: {proj.pinned_order}
                </span>
              )}
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center shrink-0">
              {proj.cover_image ? (
                <>
                  <BlurImage
                    src={getDirectImageUrl(proj.cover_image, 400)}
                    alt=""
                    lowQuality
                    initialBlur="blur-xl opacity-0"
                    initialScale="scale-110"
                    loadedBlur="blur-xl opacity-30"
                    loadedScale="scale-110"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  />
                  <BlurImage
                    src={getDirectImageUrl(proj.cover_image, 400)}
                    alt={proj.title}
                    priority={index < 3}
                    loading={index >= 3 ? "eager" : undefined}
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="max-w-full max-h-full object-contain relative z-10"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 flex flex-col items-center justify-center p-4">
                  <ImageIcon className="w-6 h-6 text-primary/20 mb-1" />
                  <span className="text-primary/25 font-black uppercase tracking-widest text-[8px] text-center leading-normal">
                    No Cover Image
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {proj.description}
            </p>

            {/* Footer: Links + Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
              <div className="flex items-center gap-1.5">
                {proj.github_url && (
                  <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all cursor-pointer" title="GitHub Repository">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {proj.demo_url && (
                  <a href={proj.demo_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all cursor-pointer" title="Live Demo">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => onPreview(proj)} title="View Details" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-all cursor-pointer">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onDuplicate(proj)} title="Duplicate" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 transition-all cursor-pointer">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(proj)} title="Edit" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(proj.id)} title="Delete" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
