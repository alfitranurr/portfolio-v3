import * as React from 'react'
import { Eye, Edit3, Trash2, Image as ImageIcon } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Photo } from '@/lib/types'

interface PhotoTableViewProps {
  photos: Photo[]
  startIndex: number
  onPreview: (photo: Photo) => void
  onEdit: (photo: Photo) => void
  onDelete: (id: string) => void
}

export function PhotoTableView({ photos, startIndex, onPreview, onEdit, onDelete }: PhotoTableViewProps) {
  return (
    <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm relative z-10 w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-xs table-auto">
          <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[150px]">Preview</th>
              <th className="py-2.5 px-3">Title</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Year</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
            {photos.map((photo, index) => (
              <tr 
                key={photo.id}
                className="hover:bg-slate-500/5 transition-colors group"
              >
                <td className="py-2.5 px-3 text-center text-muted-foreground/60 font-mono text-[11px]">
                  {startIndex + index + 1}
                </td>

                <td className="py-2.5 px-3">
                  <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative shadow-xs">
                    <BlurImage
                      src={getDirectImageUrl(photo.image_url, 150)}
                      alt={photo.title || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>

                <td className="py-2.5 px-3">
                  <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={photo.title || 'Untitled'}>
                    {photo.title || 'Untitled'}
                  </h4>
                  {photo.description && (
                    <p className="text-[10px] text-muted-foreground/70 line-clamp-1 mt-0.5">
                      {photo.description}
                    </p>
                  )}
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-muted-foreground font-mono text-center">
                  {photo.year || '-'}
                </td>

                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onPreview(photo)}
                      title="View Details"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(photo)}
                      title="Edit Photo"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(photo.id)}
                      title="Delete Photo"
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
