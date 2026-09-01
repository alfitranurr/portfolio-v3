import * as React from 'react'
import { ArrowLeft, Check, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { Photo } from '@/lib/types'
import { uploadAssetAction } from '@/app/admin/actions'

interface PhotoFormProps {
  photo: Partial<Photo> | null
  onCancel: () => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdatePhoto: (updater: (prev: Partial<Photo> | null) => Partial<Photo> | null) => void
  isPending: boolean
  setNotification: (notification: { success: boolean; message: string } | null) => void
}

export function PhotoForm({
  photo,
  onCancel,
  onSave,
  onUpdatePhoto,
  isPending,
  setNotification
}: PhotoFormProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  if (!photo) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setNotification(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'photo-gallery')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        onUpdatePhoto(prev => ({ ...prev, image_url: res.url }))
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

  return (
    <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-types" />
          <span>Back to Listing</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-wider text-primary">
          {photo.id ? 'Edit Photo' : 'Add New Photo'}
        </h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form Fields */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={photo.title || ''}
                onChange={e => onUpdatePhoto(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Sunset at Beach"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Year
              </label>
              <input
                type="text"
                value={photo.year || ''}
                onChange={e => onUpdatePhoto(prev => ({ ...prev, year: e.target.value }))}
                placeholder="e.g. 2024"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={4}
                value={photo.description || ''}
                onChange={e => onUpdatePhoto(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this photo..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y"
              />
            </div>
          </div>

          {/* Right: Image Upload */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Photo URL <span className="text-primary">*</span>
              </label>
              <input
                type="url"
                required
                value={photo.image_url || ''}
                onChange={e => onUpdatePhoto(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <p className="text-[10px] text-muted-foreground leading-normal">
                Or upload below
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className={cn(
                "flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-700/50 text-xs font-bold text-center cursor-pointer hover:border-primary/50 transition-all flex items-center justify-center gap-2",
                isUploading && "opacity-50 pointer-events-none"
              )}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-muted-foreground" />
                    <span>Upload Photo</span>
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
            </div>

            {/* Preview */}
            <div className="flex justify-center pt-2">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 bg-slate-200/5 flex items-center justify-center">
                {photo.image_url ? (
                  <BlurImage
                    src={getDirectImageUrl(photo.image_url, 100)}
                    alt={photo.title || 'Photo preview'}
                    className="w-20 h-20 object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-5 rounded-xl text-xs font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Photo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
