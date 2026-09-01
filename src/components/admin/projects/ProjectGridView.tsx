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
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((proj) => (
          <motion.div
            layout
            key={proj.id}
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
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-black text-sm md:text-base leading-tight truncate text-foreground flex-1">
                  {proj.title}
                </h3>
                {proj.is_featured && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-black uppercase tracking-wider shrink-0">
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                  {proj.category === 'data' ? 'Data Science' : 'General Dev'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                  {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
                </span>
                {proj.created_at && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-semibold">
                    {new Date(proj.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
                {proj.pinned_order !== null && proj.pinned_order !== undefined && proj.pinned_order > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                    Pin: {proj.pinned_order}
                  </span>
                )}
              </div>

              <div className="relative aspect-video w-full max-h-[140px] rounded-xl overflow-hidden bg-slate-950/40 border border-slate-200/10 dark:border-slate-800/10 mt-2 flex items-center justify-center shrink-0">
                {proj.cover_image ? (
                  <>
                    <BlurImage 
                      src={getDirectImageUrl(proj.cover_image, 400)} 
                      alt="" 
                      initialBlur="blur-xl opacity-0"
                      initialScale="scale-110"
                      loadedBlur="blur-xl opacity-30"
                      loadedScale="scale-110"
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    />
                    <BlurImage 
                      src={getDirectImageUrl(proj.cover_image, 400)} 
                      alt={proj.title} 
                      referrerPolicy="no-referrer"
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

              <p className="text-xs text-muted-foreground line-clamp-2 pt-1 leading-relaxed">
                {proj.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
              <div className="flex items-center gap-2">
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                    title="GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {proj.demo_url && (
                  <a
                    href={proj.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                    title="Live Demo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onPreview(proj)}
                  title="View Details"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDuplicate(proj)}
                  title="Duplicate Project"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEdit(proj)}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(proj.id)}
                  className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
