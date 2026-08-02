'use client'

import * as React from 'react'
import { 
  Plus, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink
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

type ViewMode = 'grid' | 'table'

export function PhotosCrud({ initialPhotos }: PhotosCrudProps) {
  const [photos, setPhotos] = React.useState<Photo[]>(initialPhotos)
  const [search, setSearch] = React.useState('')
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid')

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(12)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setNotification(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'moment-photo')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        setEditingPhoto(prev => prev ? ({ ...prev, image_url: res.url }) : null)
        setNotification({ success: true, message: 'Image uploaded successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to upload image.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error uploading image.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setEditingPhoto(prev => prev ? ({ ...prev, image_url: '' }) : null)
  }

  // Filter photos
  const filtered = React.useMemo(() => {
    return photos.filter(p => p.image_url.toLowerCase().includes(search.toLowerCase()))
  }, [photos, search])

  // Reset page 1 on search change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, pageSize])

  // Pagination calculations
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize)

  const handleEdit = (photo: Photo) => {
    setEditingPhoto({ ...photo })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingPhoto({ ...DEFAULT_PHOTO })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo from gallery?')) {
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
      alert('Photo Image URL is required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await savePhotoAction(editingPhoto)
      if (res.success) {
        if (editingPhoto.id) {
          setPhotos(prev => prev.map(item => item.id === editingPhoto.id ? { ...item, ...editingPhoto } as Photo : item))
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Glass Card Container */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Moment Recap Gallery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Manage your life journey photos displayed in the Moment Recap section of your portfolio.
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
          "p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm",
          notification.success 
            ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400" 
            : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
        )}>
          {notification.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Edit Form Modal/Drawer */}
      {editingPhoto && (
        <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl max-w-lg mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
            <button
              type="button"
              onClick={() => setEditingPhoto(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <h2 className="text-xs font-black uppercase tracking-wider text-primary">
              {editingPhoto.id ? 'Edit Photo Entry' : 'Upload New Photo'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Photo Image <span className="text-primary">*</span>
                </label>
                
                <div className="flex flex-col gap-3">
                  <div className="relative group w-full h-[200px] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-950/40 flex items-center justify-center shrink-0">
                    {editingPhoto.image_url ? (
                      <>
                        <BlurImage
                          src={getDirectImageUrl(editingPhoto.image_url, 500)}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/45 mx-auto mb-2 animate-pulse" />
                        <span className="text-muted-foreground/50 text-xs">No image uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className={cn(
                      "w-full py-2.5 px-4 rounded-xl bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-700/50 text-xs font-bold text-center cursor-pointer hover:border-primary/50 transition-all flex items-center justify-center gap-2",
                      isUploading && "opacity-50 pointer-events-none"
                    )}>
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Uploading Image...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-primary" />
                          <span>Choose Local File to Upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Or enter direct URL
                      </label>
                      <input
                        type="text"
                        value={editingPhoto.image_url || ''}
                        onChange={e => setEditingPhoto(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-xs focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isUploading}
                className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-md shadow-primary/10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Gallery View & Controls */}
      {!editingPhoto && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search by photo image URL..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <span className="text-xs font-semibold text-muted-foreground">
                Showing {paginatedItems.length} of {totalItems} {totalItems === 1 ? 'photo' : 'photos'}
              </span>

              {/* View Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={cn(
                    "p-1.5 rounded-lg transition-all cursor-pointer",
                    viewMode === 'grid'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={cn(
                    "p-1.5 rounded-lg transition-all cursor-pointer",
                    viewMode === 'table'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Listing */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-extrabold text-foreground text-base">No photos found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No photos matched &quot;{search}&quot;. Click &quot;Add Photo&quot; to upload new gallery photos.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* ============================================================ */
            /* GRID VIEW */
            /* ============================================================ */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedItems.map((photo) => (
                <div
                  key={photo.id}
                  className="p-2 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950/40 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center shrink-0">
                    <BlurImage 
                      src={getDirectImageUrl(photo.image_url, 400)} 
                      alt="Moment photo" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/5 dark:border-slate-800/5">
                    <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[100px]">
                      {photo.id.slice(0, 8)}...
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(photo)}
                        className="py-1 px-2 rounded-md bg-white/5 hover:bg-white/10 text-foreground font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="py-1 px-2 rounded-md bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ============================================================ */
            /* TABLE VIEW */
            /* ============================================================ */
            <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4 w-20">Preview</th>
                      <th className="py-3.5 px-4 min-w-[300px]">Image URL Path</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
                    {paginatedItems.map((photo, index) => (
                      <tr 
                        key={photo.id}
                        className="hover:bg-slate-500/5 transition-colors group"
                      >
                        <td className="py-3.5 px-4 text-center text-muted-foreground/60 font-mono text-[11px]">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-0.5 shadow-xs">
                            <BlurImage
                              src={getDirectImageUrl(photo.image_url, 150)}
                              alt="Photo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-foreground truncate max-w-[400px]">
                              {photo.image_url}
                            </span>
                            <a
                              href={getDirectImageUrl(photo.image_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors p-1"
                              title="Open full image"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(photo)}
                              title="Edit Entry"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(photo.id)}
                              title="Delete Entry"
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
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
                <span>
                  Showing {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} of {totalItems}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                        currentPage === page
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
