import * as React from 'react'
import { Eye, Edit3, Trash2, Award } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Skill, CATEGORY_MAP } from './types'

interface SkillTableViewProps {
  skills: Skill[]
  startIndex: number
  onPreview: (skill: Skill) => void
  onEdit: (skill: Skill) => void
  onDelete: (id: string) => void
}

export function SkillTableView({ skills, startIndex, onPreview, onEdit, onDelete }: SkillTableViewProps) {
  return (
    <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm relative z-10 w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-xs table-auto">
          <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[200px]">Skill Name</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Category</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Proficiency</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
            {skills.map((skill, index) => (
              <tr 
                key={skill.id}
                className="hover:bg-slate-500/5 transition-colors group"
              >
                <td className="py-2.5 px-3 text-center text-muted-foreground/60 font-mono text-[11px]">
                  {startIndex + index + 1}
                </td>

                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-1 shadow-xs flex items-center justify-center">
                      {skill.logo_url ? (
                        <BlurImage
                          src={getDirectImageUrl(skill.logo_url, 150)}
                          alt={skill.name}
                          className="w-full h-full object-contain rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <Award className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={skill.name}>
                        {skill.name}
                      </h4>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-[10px] font-bold text-muted-foreground">
                    {CATEGORY_MAP[skill.category]}
                  </span>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  {skill.proficiency !== null && skill.proficiency !== undefined ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-12 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(skill.proficiency, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{skill.proficiency}%</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40 text-[10px]">-</span>
                  )}
                </td>

                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onPreview(skill)}
                      title="View Details"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(skill)}
                      title="Edit Skill"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(skill.id)}
                      title="Delete Skill"
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
