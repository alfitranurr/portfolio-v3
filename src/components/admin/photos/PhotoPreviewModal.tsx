import * as React from 'react'
import { X } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Photo } from '@/lib/types'

interface PhotoPreviewModalProps {
  photo: Photo | null
  onClose: () => void
  onEdit: (photo: Photo) => void
}

export function PhotoPreviewModal({ photo, onClose, onEdit }: PhotoPreviewModalProps) {
  if (!photo) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-foreground">{photo.title || 'Untitled'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950/40 border border-slate-200/10 dark:border-slate-800/10">
          <BlurImage
            src={getDirectImageUrl(photo.image_url, 800)}
            alt={photo.title || 'Photo'}
            className="w-full h-full object-contain"
          />
        </div>

        {photo.year && (
          <div className="flex gap-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
            <span className="px-2.5 py-1 rounded-md bg-white/5 font-bold text-foreground">
              Year: {photo.year}
            </span>
          </div>
        )}

        {photo.description && (
          <div className="space-y-2 text-xs text-slate-300">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
            <p className="leading-relaxed">{photo.description}</p>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => { onClose(); onEdit(photo) }}
            className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
          >
            <span>Edit Photo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
