import * as React from 'react'
import { Eye, Copy, Edit3, Trash2, Briefcase } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Experience, CATEGORY_MAP } from './types'

interface ExperienceTableViewProps {
  experiences: Experience[]
  startIndex: number
  onPreview: (experience: Experience) => void
  onEdit: (experience: Experience) => void
  onDuplicate: (experience: Experience) => void
  onDelete: (id: string) => void
}

export function ExperienceTableView({ experiences, startIndex, onPreview, onEdit, onDuplicate, onDelete }: ExperienceTableViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm relative z-10 w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-xs table-auto">
          <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[200px]">Role & Company</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Category</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Period</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Location</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
            {experiences.map((exp, index) => (
              <tr 
                key={exp.id}
                className="hover:bg-slate-500/5 transition-colors group"
              >
                <td className="py-2.5 px-3 text-center text-muted-foreground/60 font-mono text-[11px]">
                  {startIndex + index + 1}
                </td>

                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-1 shadow-xs">
                      {exp.logo_url ? (
                        <BlurImage
                          src={getDirectImageUrl(exp.logo_url, 150)}
                          alt={exp.company}
                          className="w-full h-full object-contain rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={exp.role}>
                        {exp.role}
                      </h4>
                      <p className="text-[10px] text-muted-foreground/70 line-clamp-1">
                        {exp.company}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-[10px] font-bold text-muted-foreground">
                    {CATEGORY_MAP[exp.category || 'professional']?.replace(' Experience', '')}
                  </span>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-muted-foreground font-mono text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{formatDate(exp.start_date)}</span>
                    <span className="text-[9px]">-</span>
                    <span>{exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : 'N/A'}</span>
                  </div>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-muted-foreground text-center">
                  {exp.location || '-'}
                </td>

                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onPreview(exp)}
                      title="View Details"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicate(exp)}
                      title="Duplicate Experience"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(exp)}
                      title="Edit Experience"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(exp.id)}
                      title="Delete Experience"
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
