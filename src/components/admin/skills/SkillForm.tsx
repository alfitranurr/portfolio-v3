import * as React from 'react'
import { ArrowLeft, Check, Loader2, Award, UploadCloud } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { Skill } from './types'
import { uploadAssetAction } from '@/app/admin/actions'

interface SkillFormProps {
  skill: Partial<Skill> | null
  onCancel: () => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdateSkill: (updater: (prev: Partial<Skill> | null) => Partial<Skill> | null) => void
  isPending: boolean
}

export function SkillForm({
  skill,
  onCancel,
  onSave,
  onUpdateSkill,
  isPending
}: SkillFormProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  if (!skill) return null

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'skill-icon')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        onUpdateSkill(prev => ({ ...prev, logo_url: res.url }))
      } else {
        console.error(res.error || 'Failed to upload icon.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveIcon = () => {
    onUpdateSkill(prev => ({ ...prev, logo_url: null }))
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
          {skill.id ? 'Edit Skill' : 'Add New Skill'}
        </h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form Fields */}
          <div className="lg:col-span-2 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Skill Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={skill.name || ''}
                onChange={e => onUpdateSkill(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Machine Learning, Python, Project Management"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Proficiency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Proficiency (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={skill.proficiency ?? ''}
                onChange={e => onUpdateSkill(prev => ({ ...prev, proficiency: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 85"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                rows={4}
                value={skill.description || ''}
                onChange={e => onUpdateSkill(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of how you use this skill..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y"
              />
            </div>
          </div>

          {/* Right: Icon Upload */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Skill Icon
              </label>

              <div className="flex items-center gap-4">
                <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 bg-slate-200/5 flex items-center justify-center shrink-0">
                  {skill.logo_url ? (
                    <>
                      <BlurImage
                        src={getDirectImageUrl(skill.logo_url, 200)}
                        alt="Icon preview"
                        className="w-full h-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <Award className="w-8 h-8 text-muted-foreground/30" />
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
                        <span>{skill.logo_url ? 'Change Icon' : 'Upload Icon'}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  <input
                    type="url"
                    value={skill.logo_url || ''}
                    onChange={e => onUpdateSkill(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="Or paste icon URL"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-[11px] focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-normal">
                Upload icon file or paste URL (SVG/PNG recommended)
              </p>
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
                <span>Save Skill</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
