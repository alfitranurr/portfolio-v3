import * as React from 'react'
import { ArrowLeft, Check, Loader2, UploadCloud, GraduationCap } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { Education } from './types'
import { uploadAssetAction } from '@/app/admin/actions'

interface EducationFormProps {
  education: Partial<Education> | null
  onCancel: () => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdateEducation: (updater: (prev: Partial<Education> | null) => Partial<Education> | null) => void
  isPending: boolean
  setNotification: (notification: { success: boolean; message: string } | null) => void
}

export function EducationForm({
  education,
  onCancel,
  onSave,
  onUpdateEducation,
  isPending,
  setNotification
}: EducationFormProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  if (!education) return null

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setNotification(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'edu-logo')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        onUpdateEducation(prev => ({ ...prev, logo_url: res.url }))
        setNotification({ success: true, message: 'Logo uploaded successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to upload logo.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error uploading logo.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    onUpdateEducation(prev => ({ ...prev, logo_url: null }))
  }

  return (
    <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Listing</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-wider text-primary">
          {education.id ? 'Edit Education' : 'Add New Education'}
        </h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Institution <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={education.institution || ''}
                onChange={e => onUpdateEducation(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="e.g. University of Example"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Degree <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={education.degree || ''}
                onChange={e => onUpdateEducation(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="e.g. Bachelor of Science"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Field of Study
              </label>
              <input
                type="text"
                value={education.field_of_study || ''}
                onChange={e => onUpdateEducation(prev => ({ ...prev, field_of_study: e.target.value }))}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={education.location || ''}
                onChange={e => onUpdateEducation(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Jakarta, Indonesia"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Start Date <span className="text-primary">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={education.start_date || ''}
                  onChange={e => onUpdateEducation(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  End Date
                </label>
                <input
                  type="date"
                  value={education.end_date || ''}
                  onChange={e => onUpdateEducation(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                GPA / Grade
              </label>
              <input
                type="text"
                value={education.gpa || ''}
                onChange={e => onUpdateEducation(prev => ({ ...prev, gpa: e.target.value }))}
                placeholder="e.g. 3.85 / 4.00"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Description / Achievements
              </label>
              <textarea
                rows={6}
                value={education.description || ''}
                onChange={e => onUpdateEducation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Notable achievements, honors, thesis, etc."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Institution Logo
              </label>
              
              <div className="flex items-center gap-4">
                <div className="relative group w-14 h-14 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 bg-slate-200/5 flex items-center justify-center shrink-0">
                  {education.logo_url ? (
                    <>
                      <BlurImage
                        src={getDirectImageUrl(education.logo_url, 200)}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <GraduationCap className="w-6 h-6 text-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className={cn(
                    "w-full py-2.5 px-4 rounded-xl bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-700/50 text-xs font-bold text-center cursor-pointer hover:border-primary/50 transition-all flex items-center justify-center gap-2",
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
                        <span>{education.logo_url ? 'Change Logo' : 'Upload Logo'}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  
                  <input
                    type="text"
                    value={education.logo_url || ''}
                    onChange={e => onUpdateEducation(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="Or paste Logo URL"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-[11px] focus:outline-none focus:border-primary/50"
                  />
                </div>
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
                <span>Save Education</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
