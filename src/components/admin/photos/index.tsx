'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { savePhotoAction, deletePhotoAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'
import { Photo, PhotosCrudProps, DEFAULT_PHOTO, SortField, ViewMode } from './types'
import { usePhotosFilters } from './usePhotosFilters'
import { usePagination } from './usePagination'
import { PhotosControls } from './PhotosControls'
import { PhotoGridView } from './PhotoGridView'
import { PhotoTableView } from './PhotoTableView'
import { PhotoForm } from './PhotoForm'
import { PhotoPreviewModal } from './PhotoPreviewModal'
import { PaginationControls } from './PaginationControls'

export function PhotosCrud({ initialPhotos }: PhotosCrudProps) {
  const [photos, setPhotos] = React.useState<Photo[]>(initialPhotos)
  const [prevInitialPhotos, setPrevInitialPhotos] = React.useState(initialPhotos)

  if (initialPhotos !== prevInitialPhotos) {
    setPrevInitialPhotos(initialPhotos)
    setPhotos(initialPhotos)
  }

  const [search, setSearch] = React.useState('')
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid')
  const [sortField, setSortField] = React.useState<SortField>('newest')
  const [pageSize, setPageSize] = React.useState(12)
  const [editingPhoto, setEditingPhoto] = React.useState<Partial<Photo> | null>(null)
  const [previewPhoto, setPreviewPhoto] = React.useState<Photo | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const stored = sessionStorage.getItem('photos_admin_notification')
      if (stored) {
        try {
          setNotification(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
        sessionStorage.removeItem('photos_admin_notification')
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const filteredAndSorted = usePhotosFilters(photos, search, sortField)
  const { currentPage, setCurrentPage, totalPages, startIndex } = usePagination(filteredAndSorted.length, pageSize)
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingPhoto({ ...DEFAULT_PHOTO })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      setIsPending(true)
      try {
        const res = await deletePhotoAction(id)
        if (res.success) {
          setPhotos(prev => prev.filter(p => p.id !== id))
          setNotification({ success: true, message: 'Photo deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete photo.' })
        }
      } catch (err) {
        console.error(err)
        setNotification({ success: false, message: 'Error deleting photo.' })
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPhoto?.image_url) {
      alert('Photo URL is required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await savePhotoAction(editingPhoto)
      if (res.success) {
        if (editingPhoto.id) {
          setPhotos(prev => prev.map(item => item.id === editingPhoto.id ? ((res.message || '').includes('Mock') ? { ...item, ...editingPhoto } as Photo : editingPhoto as Photo) : item))
        } else {
          sessionStorage.setItem('photos_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingPhoto(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save photo.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving photo.' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Photos Gallery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Manage photo gallery entries for the portfolio.
          </p>
        </div>

        {!editingPhoto && (
          <button
            onClick={handleCreateNew}
            className="group py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 shrink-0 self-start sm:self-center z-10"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Photo</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div className={cn(
          "p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5",
          notification.success 
            ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400" 
            : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
        )}>
          {notification.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Edit Mode View */}
      {editingPhoto && (
        <PhotoForm
          photo={editingPhoto}
          onCancel={() => setEditingPhoto(null)}
          onSave={handleSave}
          onUpdatePhoto={setEditingPhoto}
          isPending={isPending}
          setNotification={setNotification}
        />
      )}

      {/* Main Listing Controls & Views */}
      {!editingPhoto && (
        <div className="space-y-4">
          <PhotosControls
            search={search}
            onSearchChange={(val) => {
              setSearch(val)
              setCurrentPage(1)
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortField={sortField}
            onSortFieldChange={(val) => {
              setSortField(val)
              setCurrentPage(1)
            }}
            totalItems={filteredAndSorted.length}
            displayedItems={paginatedItems.length}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full"
            >
              {filteredAndSorted.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <h3 className="font-extrabold text-foreground text-base">No photos found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    No items match your search &quot;{search}&quot;. Click Add Photo button to add new entries.
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                <PhotoTableView
                  photos={paginatedItems}
                  startIndex={startIndex}
                  onPreview={setPreviewPhoto}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <PhotoGridView
                  photos={paginatedItems}
                  onPreview={setPreviewPhoto}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSorted.length}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Preview Modal */}
      {mounted && (
        <PhotoPreviewModal
          photo={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}
