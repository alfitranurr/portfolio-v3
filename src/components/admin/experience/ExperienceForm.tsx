import * as React from 'react'
import { ArrowLeft, Check, Loader2, Plus, ChevronUp, ChevronDown, X, UploadCloud, Briefcase } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { Experience } from './types'
import { uploadAssetAction } from '@/app/admin/actions'

interface ExperienceFormProps {
  experience: Partial<Experience> | null
  descriptionBullets: string[]
  onCancel: () => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdateExperience: (updater: (prev: Partial<Experience> | null) => Partial<Experience> | null) => void
  onAddBullet: () => void
  onRemoveBullet: (index: number) => void
  onBulletChange: (index: number, value: string) => void
  onMoveBullet: (index: number, direction: 'up' | 'down') => void
  isPending: boolean
  setNotification: (notification: { success: boolean; message: string } | null) => void
}

export function ExperienceForm({
  experience,
  descriptionBullets,
  onCancel,
  onSave,
  onUpdateExperience,
  onAddBullet,
  onRemoveBullet,
  onBulletChange,
  onMoveBullet,
  isPending,
  setNotification
}: ExperienceFormProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  if (!experience) return null

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setNotification(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'exp-logo')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        onUpdateExperience(prev => ({ ...prev, logo_url: res.url }))
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
    onUpdateExperience(prev => ({ ...prev, logo_url: null }))
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
          {experience.id ? 'Edit Experience' : 'Add New Experience'}
        </h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Role / Position <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={experience.role || ''}
                onChange={e => onUpdateExperience(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Senior Data Analyst"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Company / Organization <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={experience.company || ''}
                onChange={e => onUpdateExperience(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g. PT Tech Indonesia"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={experience.location || ''}
                onChange={e => onUpdateExperience(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Jakarta, Indonesia"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <select
                value={experience.category || 'professional'}
                onChange={e => onUpdateExperience(prev => ({ ...prev, category: e.target.value as 'professional' | 'committee_organization' }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="professional">Professional Experience</option>
                <option value="committee_organization">Committee & Organization</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Start Date <span className="text-primary">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={experience.start_date || ''}
                  onChange={e => onUpdateExperience(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  End Date
                </label>
                <input
                  type="date"
                  value={experience.end_date || ''}
                  onChange={e => onUpdateExperience(prev => ({ ...prev, end_date: e.target.value }))}
                  disabled={!!experience.is_current}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Is Current */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_current"
                checked={!!experience.is_current}
                onChange={e => onUpdateExperience(prev => ({ ...prev, is_current: e.target.checked, end_date: e.target.checked ? null : prev?.end_date }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-200/20 dark:border-slate-800/15 cursor-pointer"
              />
              <label htmlFor="is_current" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                Currently Working Here
              </label>
            </div>

            {/* Logo Upload */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Company Logo
              </label>
              
              <div className="flex items-center gap-4">
                <div className="relative group w-14 h-14 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 bg-slate-200/5 flex items-center justify-center shrink-0">
                  {experience.logo_url ? (
                    <>
                      <BlurImage
                        src={getDirectImageUrl(experience.logo_url, 200)}
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
                    <Briefcase className="w-6 h-6 text-muted-foreground/40" />
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
                        <span>{experience.logo_url ? 'Change Logo' : 'Upload Logo'}</span>
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
                    value={experience.logo_url || ''}
                    onChange={e => onUpdateExperience(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="Or paste Logo URL"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-[11px] focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Description Bullets */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Job Responsibilities
                </label>
                <button
                  type="button"
                  onClick={onAddBullet}
                  className="py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-primary/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bullet</span>
                </button>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {descriptionBullets.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8 border border-dashed border-slate-200/10 dark:border-slate-800/10 rounded-xl">
                    No responsibilities added yet. Click {"Add Bullet"} to start.
                  </p>
                ) : (
                  descriptionBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10">
                      <div className="flex flex-col gap-1 shrink-0 pt-1">
                        <button
                          type="button"
                          onClick={() => onMoveBullet(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveBullet(idx, 'down')}
                          disabled={idx === descriptionBullets.length - 1}
                          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <textarea
                        value={bullet}
                        onChange={e => onBulletChange(idx, e.target.value)}
                        placeholder={`Responsibility ${idx + 1}`}
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-xs focus:outline-none focus:border-primary/50 transition-all resize-y"
                      />
                      
                      <button
                        type="button"
                        onClick={() => onRemoveBullet(idx)}
                        className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
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
                <span>Save Experience</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
