'use client'

import * as React from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react'
import { savePhotoAction, deletePhotoAction, uploadAssetAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { Photo } from '@/lib/types'
import { BlurImage } from '@/components/ui/blur-image'

interface PhotosCrudProps {
  initialPhotos: Photo[]
}

const DEFAULT_PHOTO: Omit<Photo, 'id'> = {
  title: '',
  year: '',
  description: '',
  image_url: ''
}

export function PhotosCrud({ initialPhotos }: PhotosCrudProps) {
  const [photos, setPhotos] = React.useState<Photo[]>(initialPhotos)
  const [search, setSearch] = React.useState('')
  const [editingPhoto, setEditingPhoto] = React.useState<Partial<Photo> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    setPhotos(initialPhotos)
  }, [initialPhotos])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('photos_admin_notification')
    if (stored) {
      try {
        setNotification(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
      sessionStorage.removeItem('photos_admin_notification')
    }
  }, [])

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const filtered = photos.filter(p => {
    if (!search) return true
    const term = search.toLowerCase()
    return (p.image_url && p.image_url.toLowerCase().includes(term)) || p.id.includes(term)
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setNotification(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'journey-photo')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        setEditingPhoto(prev => prev ? ({ ...prev, image_url: res.url }) : null)
        setNotification({ success: true, message: 'Image uploaded successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to upload image.' })
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ success: false, message: 'Error uploading image.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setEditingPhoto(prev => prev ? ({ ...prev, image_url: '' }) : null)
  }

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo)
  }

  const handleCreateNew = () => {
    setEditingPhoto({ ...DEFAULT_PHOTO })
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
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPhoto?.image_url) {
      alert('Image URL or Uploaded Image is required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await savePhotoAction(editingPhoto)
      if (res.success) {
        sessionStorage.setItem('photos_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
        window.location.reload()
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save photo.' })
        setIsPending(false)
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving photo.' })
      setIsPending(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden animate-fade-in space-y-3">
      {/* Header (Static & Compact) */}
      <div className="flex justify-between items-center shrink-0 pb-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Moment Recap Gallery</h1>
          <p className="text-[10px] text-muted-foreground">
            Manage your life journey photos displayed in the Moment Recap section of your portfolio.
          </p>
        </div>
        {!editingPhoto && (
          <button
            onClick={handleCreateNew}
            className="py-2 px-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer shadow-md shadow-primary/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        )}
      </div>

      {/* Notifications (Static & Compact) */}
      {notification && (
        <div className={cn(
          "p-3 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0",
          notification.success 
            ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400" 
            : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
        )}>
          {notification.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Edit Mode View (Scrolls Internally & Compact) */}
      {editingPhoto && (
        <div className="flex-grow overflow-y-auto min-h-0 pr-1 pb-4 flex items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-4 md:p-5 space-y-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/10 dark:border-slate-800/10">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
              <h2 className="text-[10px] font-black uppercase tracking-wider text-primary">
                {editingPhoto.id ? 'Edit Photo' : 'Upload Photo'}
              </h2>
            </div>
 
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Photo Image <span className="text-primary">*</span>
                  </label>
                  
                  <div className="flex flex-col gap-3">
                    {/* Small Preview Box */}
                    <div className="relative group w-full h-[150px] rounded-xl overflow-hidden border border-slate-350 dark:border-slate-800/60 bg-slate-250/5 flex items-center justify-center shrink-0">
                      {editingPhoto.image_url ? (
                        <>
                          <BlurImage
                            src={getDirectImageUrl(editingPhoto.image_url, 400)}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/45 mx-auto mb-1 animate-pulse" />
                          <span className="text-muted-foreground/50 text-[10px]">No image uploaded</span>
                        </div>
                      )}
                    </div>
 
                    <div className="space-y-1.5">
                      <label className={cn(
                        "w-full py-2 px-3 rounded-lg bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-700/50 text-[10px] font-bold text-center cursor-pointer hover:border-primary/50 transition-all flex items-center justify-center gap-1.5",
                        isUploading && "opacity-50 pointer-events-none"
                      )}>
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{editingPhoto.image_url ? 'Choose Different File' : 'Choose File'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      
                      <input
                        type="text"
                        value={editingPhoto.image_url || ''}
                        onChange={e => setEditingPhoto(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="Or paste Direct Image URL"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-[10px] focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-200/10 dark:border-slate-800/10">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="py-1.5 px-3.5 rounded-lg text-[10px] font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="py-1.5 px-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-[10px] flex items-center gap-1 hover:bg-primary/90 transition-all cursor-pointer shadow-md shadow-primary/10"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Save Photo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Listing View (Scrolls Internally) */}
      {!editingPhoto && (
        <div className="flex-grow flex flex-col overflow-hidden min-h-0 space-y-3">
          {/* Controls bar (Static) */}
          <div className="flex justify-between items-center gap-4 shrink-0">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search by image URL..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-[11px] focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
              Showing {filtered.length} photos
            </span>
          </div>

          {/* Cards listing (Scrollable & Compact 4-column) */}
          <div className="flex-grow overflow-y-auto overflow-x-hidden min-h-0 pr-1 pb-4 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 space-y-2">
                <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <h3 className="font-extrabold text-foreground text-xs">No photos found</h3>
                <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                  Click the "Add Photo" button to upload your first image.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((photo) => (
                  <div
                    key={photo.id}
                    className="p-1.5 rounded-xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between group"
                  >
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-950/40 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center shrink-0">
                      <BlurImage 
                        src={getDirectImageUrl(photo.image_url, 300)} 
                        alt="Moment photo" 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Actions Footer */}
                    <div className="flex gap-1.5 justify-end pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
                      <button
                        onClick={() => handleEdit(photo)}
                        className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 text-foreground font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="py-1 px-2.5 rounded bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
