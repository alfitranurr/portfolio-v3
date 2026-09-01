import * as React from 'react'
import { Eye, Copy, Edit3, Trash2, Image as ImageIcon } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Project, SUBCATEGORY_MAP } from './types'

interface ProjectTableViewProps {
  projects: Project[]
  startIndex: number
  onPreview: (project: Project) => void
  onEdit: (project: Project) => void
  onDuplicate: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectTableView({ projects, startIndex, onPreview, onEdit, onDuplicate, onDelete }: ProjectTableViewProps) {
  return (
    <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm relative z-10 w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-xs table-auto">
          <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[220px]">Project Title</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Subcategory</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Status & Pin</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Created Date</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
            {projects.map((proj, index) => (
              <tr 
                key={proj.id}
                className="hover:bg-slate-500/5 transition-colors group"
              >
                <td className="py-2.5 px-3 text-center text-muted-foreground/60 font-mono text-[11px]">
                  {startIndex + index + 1}
                </td>

                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-7 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-0.5 shadow-xs">
                      {proj.cover_image ? (
                        <BlurImage
                          src={getDirectImageUrl(proj.cover_image, 150)}
                          alt={proj.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={proj.title}>
                        {proj.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground/70 line-clamp-1">
                        {proj.description}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-[10px] font-bold text-muted-foreground">
                    {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
                  </span>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    {proj.is_featured && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 text-[9px] font-black uppercase">
                        Featured
                      </span>
                    )}
                    {proj.pinned_order !== null && proj.pinned_order !== undefined && proj.pinned_order > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                        Pin: {proj.pinned_order}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 text-[10px]">-</span>
                    )}
                  </div>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-muted-foreground font-mono text-center">
                  {proj.created_at ? new Date(proj.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </td>

                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
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
                      title="Edit Project"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(proj.id)}
                      title="Delete Project"
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer border border-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
