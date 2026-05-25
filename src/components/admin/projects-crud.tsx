'use client'

import * as React from 'react'
import { 
  FolderCode, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ExternalLink, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileCode,
  Layers,
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  Presentation
} from 'lucide-react'
import { saveProjectAction, deleteProjectAction, uploadAssetAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'

interface Project {
  id: string
  title: string
  description: string
  content: string | null
  category: 'data' | 'non-data'
  sub_category: string
  cover_image: string | null
  github_url: string | null
  demo_url: string | null
  notebook_url: string | null
  slide_url?: string | null
  embed_code: string | null
  is_featured: boolean | null
  pinned_order: number | null
  created_at?: string
  updated_at?: string
}

interface ProjectsCrudProps {
  initialProjects: Project[]
}

const DATA_SUBCATEGORIES = [
  'Data Analytics Projects',
  'Data Visualization Projects',
  'Artificial Intelligence Projects',
  'Data Automation Projects',
  'Data Modeling and Simulation Projects',
]

const NON_DATA_SUBCATEGORIES = [
  'Web Development Projects',
  'Mobile Development Projects',
  'Digital Marketing Projects',
  'Graphic Design Projects',
]

const SUBCATEGORY_MAP: Record<string, string> = {
  'All': 'All Subcategories',
  'Data Analytics Projects': 'Data Analytics',
  'Data Visualization Projects': 'Data Visualization',
  'Artificial Intelligence Projects': 'Artificial Intelligence',
  'Data Automation Projects': 'Data Automation',
  'Data Modeling and Simulation Projects': 'Data Modeling & Simulation',
  'Web Development Projects': 'Web Development',
  'Mobile Development Projects': 'Mobile Development',
  'Digital Marketing Projects': 'Digital Marketing',
  'Graphic Design Projects': 'Graphic Design',
}

const DEFAULT_PROJECT: Omit<Project, 'id'> = {
  title: '',
  description: '',
  content: '',
  category: 'data',
  sub_category: 'Data Analytics Projects',
  cover_image: '',
  github_url: '',
  demo_url: '',
  notebook_url: '',
  slide_url: '',
  embed_code: '',
  is_featured: false,
  pinned_order: 0
}

export function ProjectsCrud({ initialProjects }: ProjectsCrudProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects)
  const [search, setSearch] = React.useState('')
  const [activeSubCategory, setActiveSubCategory] = React.useState<string>('All')
  const [editingProject, setEditingProject] = React.useState<Partial<Project> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

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
        setEditingProject(prev => prev ? ({ ...prev, cover_image: res.url }) : null)
        setNotification({ success: true, message: 'Cover image uploaded successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to upload cover image.' })
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ success: false, message: 'Error uploading cover image.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveCoverImage = () => {
    setEditingProject(prev => prev ? ({ ...prev, cover_image: null }) : null)
  }

  // Compute subcategory options dynamically for filtering listing
  const availableFilters = React.useMemo(() => {
    const uniqueInDb = Array.from(new Set(projects.map(p => p.sub_category))).filter(Boolean)
    const base = ['All', ...DATA_SUBCATEGORIES, ...NON_DATA_SUBCATEGORIES]
    const combined = [...base]
    uniqueInDb.forEach(sub => {
      if (!combined.includes(sub)) {
        combined.push(sub)
      }
    })
    return combined
  }, [projects])

  // Subcategory options for dropdown in edit form
  const currentCategory = editingProject?.category || 'data'
  const subCategoryOptions = React.useMemo(() => {
    return currentCategory === 'data' ? DATA_SUBCATEGORIES : NON_DATA_SUBCATEGORIES
  }, [currentCategory])

  const finalOptions = React.useMemo(() => {
    if (editingProject?.sub_category && !subCategoryOptions.includes(editingProject.sub_category)) {
      return [editingProject.sub_category, ...subCategoryOptions]
    }
    return subCategoryOptions
  }, [editingProject?.sub_category, subCategoryOptions])

  React.useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('project_admin_notification')
    if (stored) {
      try {
        setNotification(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
      sessionStorage.removeItem('project_admin_notification')
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

  // Filter
  const filtered = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sub_category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    
    const matchesSubCategory = activeSubCategory === 'All' || p.sub_category === activeSubCategory
    return matchesSearch && matchesSubCategory
  })

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingProject({ ...DEFAULT_PROJECT })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setIsPending(true)
      try {
        const res = await deleteProjectAction(id)
        if (res.success) {
          setProjects(prev => prev.filter(p => p.id !== id))
          setNotification({ success: true, message: 'Project deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete project.' })
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
    if (!editingProject?.title || !editingProject?.description) {
      alert('Title and Description are required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await saveProjectAction(editingProject)
      if (res.success) {
        // Refresh local array
        if (editingProject.id) {
          setProjects(prev => prev.map(p => p.id === editingProject.id ? ((res.message || '').includes('Mock') ? { ...p, ...editingProject } as Project : editingProject as Project) : p))
        } else {
          // If insert, re-query page or push
          // Since it's mockup or db, we update list locally. In db mode, page reload validates
          sessionStorage.setItem('project_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingProject(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save project.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving project.' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Projects Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish and manage data science case studies and web applications.
          </p>
        </div>
        {!editingProject && (
          <button
            onClick={handleCreateNew}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
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
      {editingProject && (
        <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
            <button
              onClick={() => setEditingProject(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Listing</span>
            </button>
            <h2 className="text-sm font-black uppercase tracking-wider text-primary">
              {editingProject.id ? 'Edit Project Details' : 'Create New Project'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
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
                    value={editingProject.title || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. XGBoost Predictive customer model"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Short Description <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingProject.description || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Summarize the core impact or solution of the project in 2-3 sentences."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Grid Category & Sub */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Category Type
                    </label>
                    <select
                      value={editingProject.category || 'data'}
                      onChange={e => {
                        const newCat = e.target.value as 'data' | 'non-data'
                        const defaultSub = newCat === 'data' ? 'Data Analytics Projects' : 'Web Development Projects'
                        setEditingProject(prev => ({
                          ...prev,
                          category: newCat,
                          sub_category: defaultSub
                        }))
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800/20 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="data" className="bg-white dark:bg-slate-950 text-foreground">Data Science</option>
                      <option value="non-data" className="bg-white dark:bg-slate-950 text-foreground">Web Dev / Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Sub Category Tag
                    </label>
                    <select
                      value={editingProject.sub_category || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, sub_category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800/20 text-foreground text-sm focus:outline-none focus:border-primary/50"
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
                      value={editingProject.github_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, github_url: e.target.value }))}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.demo_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, demo_url: e.target.value }))}
                      placeholder="https://my-demo.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
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
                      value={editingProject.notebook_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, notebook_url: e.target.value }))}
                      placeholder="https://colab.research.google.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Reporting Presentation
                    </label>
                    <input
                      type="url"
                      value={editingProject.slide_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, slide_url: e.target.value }))}
                      placeholder="https://canva.com/design/... or Google Slides link"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Cover Image Upload Container (Full Width) */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Cover Image
                  </label>
                  
                  <div className="flex items-center gap-4">
                    {/* Preview box */}
                    <div className="relative group w-14 h-14 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800/50 bg-slate-200/5 flex items-center justify-center shrink-0">
                      {editingProject.cover_image ? (
                        <>
                          <img
                            src={getDirectImageUrl(editingProject.cover_image, 200)}
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
                        "w-full py-2.5 px-4 rounded-xl bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-800/50 text-xs font-bold text-center cursor-pointer hover:border-primary/50 transition-all flex items-center justify-center gap-2",
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
                            <span>{editingProject.cover_image ? 'Change Cover' : 'Upload Cover'}</span>
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
                        value={editingProject.cover_image || ''}
                        onChange={e => setEditingProject(prev => ({ ...prev, cover_image: e.target.value }))}
                        placeholder="Or paste Cover Image URL"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-[11px] focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Code & Markdown */}
              <div className="space-y-4">
                {/* Embed Iframe code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <span>BI Dashboard Embed Code</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(Tableau/Plotly Iframe HTML)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editingProject.embed_code || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, embed_code: e.target.value }))}
                    placeholder="<iframe src='https://public.tableau.com/...' width='100%' height='600'></iframe>"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground font-mono placeholder:text-muted-foreground/30 text-xs focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Write-up Markdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Detailed Case Study (Markdown Supported)
                  </label>
                  <textarea
                    rows={8}
                    value={editingProject.content || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="## Executive Summary&#10;Write detailed methodologies, Python code samples, and model evaluation results here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Priority and Toggle flags */}
                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={!!editingProject.is_featured}
                      onChange={e => setEditingProject(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-200/20 dark:border-slate-800/15"
                    />
                    <label htmlFor="is_featured" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                      Feature on Home
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Pinned Order Index
                    </label>
                    <input
                      type="number"
                      value={editingProject.pinned_order ?? 0}
                      onChange={e => setEditingProject(prev => ({ ...prev, pinned_order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
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
      )}

      {/* Grid listing */}
      {!editingProject && (
        <div className="space-y-4">
          {/* Filtering */}
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filtered.length} projects
            </span>
          </div>

          {/* Subcategory Filters */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableFilters.map((subcat) => (
              <button
                key={subcat}
                type="button"
                onClick={() => setActiveSubCategory(subcat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
                  activeSubCategory === subcat
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-foreground/80 hover:text-foreground"
                )}
              >
                {SUBCATEGORY_MAP[subcat] || subcat.replace(' Projects', '')}
              </button>
            ))}
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 space-y-3">
              <FolderCode className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-extrabold text-foreground">No projects found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No items match your search. Create one by clicking the Add Project button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-sm md:text-base leading-tight truncate text-foreground flex-1">
                        {proj.title}
                      </h3>
                      {proj.is_featured && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-black uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                        {proj.category === 'data' ? 'Data Science' : 'Web Dev / Other'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                        {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
                      </span>
                      {proj.pinned_order !== null && proj.pinned_order !== undefined && proj.pinned_order > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                          Pin: {proj.pinned_order}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
                    <div className="flex items-center gap-2">
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                        >
                          <FileCode className="w-4 h-4" />
                        </a>
                      )}
                      {proj.demo_url && (
                        <a
                          href={proj.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {proj.slide_url && (
                        <a
                          href={proj.slide_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                          title="Presentation Deck"
                        >
                          <Presentation className="w-4 h-4" />
                        </a>
                      )}
                      {proj.embed_code && (
                        <span className="p-2 rounded-lg bg-white/5 text-primary flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                          <Layers className="w-3.5 h-3.5" />
                          Dashboard
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(proj)}
                        className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
