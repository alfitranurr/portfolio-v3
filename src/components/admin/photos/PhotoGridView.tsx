import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Edit3, Trash2 } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Photo } from '@/lib/types'

interface PhotoGridViewProps {
  photos: Photo[]
  onPreview: (photo: Photo) => void
  onEdit: (photo: Photo) => void
  onDelete: (id: string) => void
}

export function PhotoGridView({ photos, onPreview, onEdit, onDelete }: PhotoGridViewProps) {
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {photos.map((photo) => (
          <motion.div
            layout
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{
              layout: { type: 'spring', stiffness: 220, damping: 24, mass: 0.8 },
              opacity: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
            }}
            className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden hover:border-primary/30 transition-[border-color,box-shadow] duration-300 group transform-gpu"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="aspect-video w-full relative">
              <BlurImage
                src={getDirectImageUrl(photo.image_url, 400)}
                alt={photo.title || 'Photo'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                <button
                  onClick={() => onPreview(photo)}
                  title="View Details"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-400 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(photo)}
                  title="Edit Photo"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(photo.id)}
                  title="Delete Photo"
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-3 space-y-1">
              <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {photo.title || 'Untitled'}
              </h3>
              {photo.year && (
                <p className="text-[10px] text-muted-foreground">{photo.year}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
