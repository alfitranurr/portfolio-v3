import * as React from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Edit3 } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Photo } from '@/lib/types'

interface PhotoPreviewModalProps {
  photo: Photo | null
  onClose: () => void
  onEdit: (photo: Photo) => void
}

export function PhotoPreviewModal({ photo, onClose, onEdit }: PhotoPreviewModalProps) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!photo || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-foreground leading-snug truncate">
                {photo.title || 'Untitled'}
              </h3>
              {photo.year && (
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {photo.year}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center">
          <BlurImage
            src={getDirectImageUrl(photo.image_url, 1000)}
            alt={photo.title || 'Photo'}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Body — scrollable for long descriptions */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {photo.description ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Description
              </span>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
                {photo.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">No description provided.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { onClose(); onEdit(photo) }}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 active:scale-[0.98] cursor-pointer shadow-md shadow-primary/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Photo</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
