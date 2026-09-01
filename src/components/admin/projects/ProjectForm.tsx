import * as React from 'react'
import { ArrowLeft, Check, Loader2, Layers, UploadCloud, Image as ImageIcon } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { Project, DATA_SUBCATEGORIES, NON_DATA_SUBCATEGORIES, SUBCATEGORY_MAP } from './types'
import { uploadAssetAction } from '@/app/admin/actions'

interface ProjectFormProps {
  project: Partial<Project> | null
  projects: Project[]
  onCancel: () => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdateProject: (updater: (prev: Partial<Project> | null) => Partial<Project> | null) => void
  onOpenOrderModal: () => void
  onOpenFeaturedOrderModal: () => void
  isPending: boolean
  setNotification: (notification: { success: boolean; message: string } | null) => void
}

export function ProjectForm({
  project,
  projects,
  onCancel,
  onSave,
  onUpdateProject,
  onOpenOrderModal,
  onOpenFeaturedOrderModal,
  isPending,
  setNotification
}: ProjectFormProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  if (!project) return null

  const currentCategory = project.category || 'data'
  const subCategoryOptions = currentCategory === 'data' ? DATA_SUBCATEGORIES : NON_DATA_SUBCATEGORIES

  const finalOptions = React.useMemo(() => {
    if (project.sub_category && !subCategoryOptions.includes(project.sub_category)) {
      return [project.sub_category, ...subCategoryOptions]
    }
    return subCategoryOptions
  }, [project.sub_category, subCategoryOptions])

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setNotification(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'project-cover')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        onUpdateProject(prev => prev ? ({ ...prev, cover_image: res.url }) : null)
        setNotification({ success: true, message: 'Cover image uploaded successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to upload cover image.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error uploading cover image.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveCoverImage = () => {
    onUpdateProject(prev => prev ? ({ ...prev, cover_image: null }) : null)
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
          {project.id ? 'Edit Project Details' : 'Create New Project'}
        </h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Basic Info */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Project Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={project.title || ''}
                onChange={e => onUpdateProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. XGBoost Predictive customer model"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Short Description <span className="text-primary">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={project.description || ''}
                onChange={e => onUpdateProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Summarize the core impact or solution of the project in 2-3 sentences."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y"
              />
            </div>

            {/* Grid Category & Sub */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Category Type
                </label>
                <select
                  value={project.category || 'data'}
                  onChange={e => {
                    const newCat = e.target.value as 'data' | 'non-data'
                    const defaultSub = newCat === 'data' ? 'Data Analytics Projects' : 'Web Development Projects'
                    
                    const categoryProjects = projects.filter(p => p.category === newCat)
                    const maxPin = categoryProjects.reduce((max, p) => Math.max(max, p.pinned_order || 0), 0)

                    onUpdateProject(prev => ({
                      ...prev,
                      category: newCat,
                      sub_category: defaultSub,
                      pinned_order: maxPin + 1
                    }))
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value="data" className="bg-white dark:bg-slate-950 text-foreground">Data Science</option>
                  <option value="non-data" className="bg-white dark:bg-slate-950 text-foreground">General Dev</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Sub Category Tag
                </label>
                <select
                  value={project.sub_category || ''}
                  onChange={e => onUpdateProject(prev => ({ ...prev, sub_category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                >
                  {finalOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-white dark:bg-slate-950 text-foreground">
                      {SUBCATEGORY_MAP[opt] || opt.replace(' Projects', '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={project.github_url || ''}
                  onChange={e => onUpdateProject(prev => ({ ...prev, github_url: e.target.value }))}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={project.demo_url || ''}
                  onChange={e => onUpdateProject(prev => ({ ...prev, demo_url: e.target.value }))}
                  placeholder="https://my-demo.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Jupyter Notebook URL
                </label>
                <input
                  type="url"
                  value={project.notebook_url || ''}
                  onChange={e => onUpdateProject(prev => ({ ...prev, notebook_url: e.target.value }))}
                  placeholder="https://colab.research.google.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Reporting Presentation
                </label>
                <input
                  type="url"
                  value={project.slide_url || ''}
                  onChange={e => onUpdateProject(prev => ({ ...prev, slide_url: e.target.value }))}
                  placeholder="https://canva.com/design/... or Google Slides link"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Code & Markdown */}
          <div className="space-y-4">
            {/* Write-up Markdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Detailed Case Study (Markdown Supported)
              </label>
              <textarea
                rows={8}
                value={project.content || ''}
                onChange={e => onUpdateProject(prev => ({ ...prev, content: e.target.value }))}
                placeholder="## Executive Summary&#10;Write detailed methodologies, Python code samples, and model evaluation results here..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Priority and Toggle flags */}
            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenFeaturedOrderModal}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all flex items-center justify-center border border-primary/20 cursor-pointer shrink-0"
                    title="Manage Featured Orders"
                    aria-label="Manage Featured Orders"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={!!project.is_featured}
                      onChange={e => {
                        const val = e.target.checked
                        if (val) {
                          const featuredCount = projects.filter(p => p.is_featured && p.id !== project.id).length
                          if (featuredCount >= 9) {
                            alert('You can only feature a maximum of 9 projects on the home page. Please unmark another project as featured first.')
                            return
                          }
                        }
                        onUpdateProject(prev => prev ? ({ ...prev, is_featured: val }) : null)
                      }}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-200/20 dark:border-slate-800/15 cursor-pointer"
                    />
                    <label htmlFor="is_featured" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                      Feature on Home
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-9">
                  <input
                    type="checkbox"
                    id="is_on_progress"
                    checked={!!project.is_on_progress}
                    onChange={e => {
                      const val = e.target.checked
                      onUpdateProject(prev => prev ? ({ ...prev, is_on_progress: val }) : null)
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-200/20 dark:border-slate-800/15 cursor-pointer"
                  />
                  <label htmlFor="is_on_progress" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                    On Progress
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Pinned Order Index
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onOpenOrderModal}
                    className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all flex items-center justify-center border border-primary/20 cursor-pointer shrink-0"
                    title="Manage Pinned Orders"
                    aria-label="Manage Pinned Orders"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={project.pinned_order ?? 0}
                    readOnly
                    className={cn(
                      "flex-1 min-w-0 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/3 border text-foreground text-sm focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-not-allowed select-none",
                      project.pinned_order && project.pinned_order > 0 && projects.some(p => p.id !== project.id && p.category === project.category && p.pinned_order === project.pinned_order)
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 dark:border-slate-700/50 focus:border-primary/50"
                    )}
                  />
                </div>
                {project.pinned_order && project.pinned_order > 0 && projects.some(p => p.id !== project.id && p.category === project.category && p.pinned_order === project.pinned_order) && (
                  <p className="text-[10px] text-red-500 font-semibold leading-normal mt-1">
                    This index is already pinned in the current category!
                  </p>
                )}
              </div>
            </div>

            {/* Project Publish Date */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Project Date (Publish Date)
              </label>
              <input
                type="date"
                value={project.created_at ? project.created_at.split('T')[0] : ''}
                onChange={e => onUpdateProject(prev => ({ ...prev, created_at: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground leading-normal">
                Controls chronological ordering on the public portfolio pages.
              </p>
            </div>

            {/* Cover Image Upload Container */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Cover Image
              </label>
              
              <div className="flex items-center gap-4">
                {/* Preview box */}
                <div className="relative group w-14 h-14 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 bg-slate-200/5 flex items-center justify-center shrink-0">
                  {project.cover_image ? (
                    <>
                      <BlurImage
                        src={getDirectImageUrl(project.cover_image, 200)}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveCoverImage}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
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
                        <span>{project.cover_image ? 'Change Cover' : 'Upload Cover'}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  
                  <input
                    type="text"
                    value={project.cover_image || ''}
                    onChange={e => onUpdateProject(prev => ({ ...prev, cover_image: e.target.value }))}
                    placeholder="Or paste Cover Image URL"
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
                <span>Save Project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
