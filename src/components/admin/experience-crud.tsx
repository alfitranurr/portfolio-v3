'use client'

import * as React from 'react'
import { 
  Briefcase, 
  Plus, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Calendar,
  MapPin,
  ArrowLeft,
  ListTodo,
  ChevronUp,
  ChevronDown,
  UploadCloud,
  LayoutList,
  LayoutGrid,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react'
import { saveExperienceAction, deleteExperienceAction, uploadAssetAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'

interface Experience {
  id: string
  role: string
  company: string
  location: string | null
  start_date: string
  end_date: string | null
  description: string[]
  is_current: boolean | null
  category?: 'professional' | 'committee_organization'
  logo_url?: string | null
  created_at?: string
  updated_at?: string
}

interface ExperienceCrudProps {
  initialExperience: Experience[]
}

const CATEGORIES = ['All', 'professional', 'committee_organization']
const CATEGORY_MAP: Record<string, string> = {
  All: 'All Experiences',
  professional: 'Professional Experience',
  committee_organization: 'Committee & Organization'
}

const DEFAULT_EXPERIENCE: Omit<Experience, 'id'> = {
  role: '',
  company: '',
  location: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  description: [],
  is_current: false,
  category: 'professional',
  logo_url: ''
}

type ViewMode = 'table' | 'grid'
type SortField = 'newest' | 'oldest' | 'company' | 'role'

export function ExperienceCrud({ initialExperience }: ExperienceCrudProps) {
  const [experienceList, setExperienceList] = React.useState<Experience[]>(initialExperience)
  const [prevInitialExperience, setPrevInitialExperience] = React.useState(initialExperience)

  if (initialExperience !== prevInitialExperience) {
    setPrevInitialExperience(initialExperience)
    setExperienceList(initialExperience)
  }

  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('All')
  const [viewMode, setViewMode] = React.useState<ViewMode>('table')
  const [sortField, setSortField] = React.useState<SortField>('newest')

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const [editingItem, setEditingItem] = React.useState<Partial<Experience> | null>(null)
  const [descriptionBullets, setDescriptionBullets] = React.useState<string[]>([])
  const [isPending, setIsPending] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const stored = sessionStorage.getItem('experience_admin_notification')
      if (stored) {
        try {
          setNotification(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
        sessionStorage.removeItem('experience_admin_notification')
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
        setEditingItem(prev => ({ ...prev, logo_url: res.url }))
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

  // Filter and Sort logic
  const filteredAndSorted = React.useMemo(() => {
    const result = experienceList.filter(e => {
      const q = search.toLowerCase()
      const matchesSearch = 
        e.role.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q)
      const matchesCategory = activeCategory === 'All' || (e.category || 'professional') === activeCategory
      return matchesSearch && matchesCategory
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      }
      if (sortField === 'company') {
        return a.company.localeCompare(b.company)
      }
      if (sortField === 'role') {
        return a.role.localeCompare(b.role)
      }
      return 0
    })

    return result
  }, [experienceList, search, activeCategory, sortField])

  // Pagination calculations
  const totalItems = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

  const [previewItem, setPreviewItem] = React.useState<Experience | null>(null)

  const handleEdit = (item: Experience) => {
    const start_date = item.start_date ? item.start_date.split('T')[0] : ''
    const end_date = item.end_date ? item.end_date.split('T')[0] : ''
    setEditingItem({ ...item, start_date, end_date, category: item.category || 'professional', logo_url: item.logo_url || '' })
    setDescriptionBullets(item.description || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDuplicate = (item: Experience) => {
    const start_date = item.start_date ? item.start_date.split('T')[0] : ''
    const end_date = item.end_date ? item.end_date.split('T')[0] : ''
    setEditingItem({ 
      ...item, 
      id: undefined, 
      role: `${item.role} (Copy)`,
      start_date, 
      end_date, 
      category: item.category || 'professional', 
      logo_url: item.logo_url || '' 
    })
    setDescriptionBullets(item.description ? [...item.description] : [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingItem({ ...DEFAULT_EXPERIENCE })
    setDescriptionBullets([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this experience entry?')) {
      setIsPending(true)
      try {
        const res = await deleteExperienceAction(id)
        if (res.success) {
          setExperienceList(prev => prev.filter(e => e.id !== id))
          setNotification({ success: true, message: 'Experience deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete experience.' })
        }
      } catch (err) {
        console.error(err)
        setNotification({ success: false, message: 'Error deleting experience.' })
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleAddBullet = () => {
    setDescriptionBullets(prev => [...prev, ''])
  }

  const handleRemoveBullet = (index: number) => {
    setDescriptionBullets(prev => prev.filter((_, i) => i !== index))
  }

  const handleBulletChange = (index: number, value: string) => {
    setDescriptionBullets(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleMoveBullet = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === descriptionBullets.length - 1)) return
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    setDescriptionBullets(prev => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[targetIdx]
      copy[targetIdx] = temp
      return copy
    })
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem?.role || !editingItem?.company || !editingItem?.start_date) {
      alert('Role, Company, and Start Date are required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    const parsedDesc = descriptionBullets
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const payload = {
      ...editingItem,
      description: parsedDesc
    }

    try {
      const res = await saveExperienceAction(payload)
      if (res.success) {
        if (editingItem.id) {
          setExperienceList(prev => prev.map(item => item.id === editingItem.id ? ((res.message || '').includes('Mock') ? { ...item, ...payload } as Experience : payload as Experience) : item))
        } else {
          sessionStorage.setItem('experience_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingItem(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save experience.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving experience.' })
    } finally {
      setIsPending(false)
    }
  }

  const getCategoryBadge = (category?: string) => {
    if (category === 'committee_organization') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
          <Briefcase className="w-3 h-3 text-emerald-400" />
          <span>Organization</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
        <Building2 className="w-3 h-3 text-sky-400" />
        <span>Professional</span>
      </span>
    )
  }

  const formatPeriod = (startStr: string, endStr: string | null, isCurrent: boolean | null) => {
    if (!startStr) return '-'
    const startYear = new Date(startStr).getFullYear()
    if (isCurrent) return `${startYear} - Present`
    if (!endStr) return `${startYear}`
    const endYear = new Date(endStr).getFullYear()
    return `${startYear} - ${endYear}`
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Glass Card Container */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Work Experiences
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Publish and manage your employment timeline, leadership roles, and research projects.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="group py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 shrink-0 self-start sm:self-center z-10"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Experience</span>
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

      {/* Edit Form Drawer */}
      {editingItem && (
        <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
            <button
              onClick={() => setEditingItem(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Listing</span>
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-wider text-primary">
                {editingItem.id ? 'Edit Experience Details' : 'Add New Work Experience'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Job Role / Position Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.role || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Data Analyst Intern"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Company / Organization Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.company || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Astra International"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Category <span className="text-primary">*</span>
                  </label>
                  <select
                    value={editingItem.category || 'professional'}
                    onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value as Experience['category'] }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="professional">Professional Experience</option>
                    <option value="committee_organization">Committee & Organization</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Jakarta, Indonesia (Hybrid)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Start Date <span className="text-primary">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editingItem.start_date || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      disabled={!!editingItem.is_current}
                      value={editingItem.is_current ? '' : (editingItem.end_date || '')}
                      onChange={e => setEditingItem(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50 disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={!!editingItem.is_current}
                    onChange={e => setEditingItem(prev => ({ 
                      ...prev, 
                      is_current: e.target.checked,
                      end_date: e.target.checked ? null : prev?.end_date 
                    }))}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <label htmlFor="is_current" className="text-xs font-bold text-foreground cursor-pointer">
                    I currently work in this role (Present)
                  </label>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Company Logo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingItem.logo_url || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="e.g. /images/company-logo.png"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <label className={cn(
                      "py-2.5 px-3 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-xs font-semibold text-foreground hover:bg-white/10 flex items-center justify-center shrink-0 cursor-pointer",
                      isUploading && "opacity-50 pointer-events-none"
                    )}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <UploadCloud className="w-4 h-4 text-primary" />}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Bullet Points Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-primary" />
                  <span>Key Responsibilities & Bullet Points</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddBullet}
                  className="py-1.5 px-3 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1 hover:bg-primary/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bullet Point</span>
                </button>
              </div>

              <div className="space-y-2">
                {descriptionBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground/50 w-5 text-right">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={e => handleBulletChange(idx, e.target.value)}
                      placeholder="e.g. Built automated data pipelines reducing latency by 30%..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-xs focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveBullet(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBullet(idx, 'down')}
                        disabled={idx === descriptionBullets.length - 1}
                        className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {descriptionBullets.length === 0 && (
                  <p className="text-xs text-muted-foreground/50 italic text-center py-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                    No bullet points added yet. Click &quot;Add Bullet Point&quot; to describe your responsibilities.
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="py-2.5 px-5 rounded-xl text-xs font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Entry...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Entry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Listing Controls & Views */}
      {!editingItem && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 relative z-30">
            {/* Top row: Search, Sort, View Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Search by job role, company, or location..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('')
                      setCurrentPage(1)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controls Group */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Sort Field Selector */}
                <CustomSortDropdown
                  value={sortField}
                  onChange={val => {
                    setSortField(val as SortField)
                    setCurrentPage(1)
                  }}
                  options={[
                    { label: 'Newest First', value: 'newest' },
                    { label: 'Oldest First', value: 'oldest' },
                    { label: 'Company (A-Z)', value: 'company' },
                    { label: 'Role (A-Z)', value: 'role' },
                  ]}
                />

                {/* View Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50">
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
                </div>
              </div>
            </div>

            {/* Bottom row: Category Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat)
                      setCurrentPage(1)
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
                      activeCategory === cat
                        ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10"
                        : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {CATEGORY_MAP[cat]}
                  </button>
                ))}
              </div>

              {/* Counter status */}
              <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                Showing {paginatedItems.length} of {totalItems} {totalItems === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          </div>

          {/* Empty State */}
          {filteredAndSorted.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
              <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-extrabold text-foreground text-base">No experiences found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No entries matched &quot;{search}&quot;. Try adjusting your search term or category filters.
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* ============================================================ */
            /* TABLE VIEW */
            /* ============================================================ */
            <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm relative z-10 w-full">
              <div className="w-full overflow-hidden">
                <table className="w-full text-left text-xs table-auto">
                  <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 w-1/3">Role & Company</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Category</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Period</th>
                      <th className="py-2.5 px-3">Location & Summary</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
                    {paginatedItems.map((item, index) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-slate-500/5 transition-colors group"
                      >
                        {/* Index */}
                        <td className="py-2.5 px-3 text-center text-muted-foreground/60 font-mono text-[11px]">
                          {startIndex + index + 1}
                        </td>

                        {/* Role & Company */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.logo_url ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-1 shadow-xs">
                                <BlurImage
                                  src={getDirectImageUrl(item.logo_url)}
                                  alt={item.company}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                                <Briefcase className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={item.role}>
                                {item.role}
                              </h4>
                              <p className="text-[11px] text-sky-400 font-semibold line-clamp-1" title={item.company}>
                                {item.company}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {getCategoryBadge(item.category)}
                          </div>
                        </td>

                        {/* Period */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-muted-foreground text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                            <span>{formatPeriod(item.start_date, item.end_date, item.is_current)}</span>
                          </div>
                        </td>

                        {/* Location & Summary */}
                        <td className="py-2.5 px-3">
                          <div className="space-y-0.5 min-w-0">
                            {item.location && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                <span className="line-clamp-1">{item.location}</span>
                              </div>
                            )}
                            {item.description && item.description.length > 0 && (
                              <p className="text-[10px] text-muted-foreground/70 line-clamp-1">
                                {item.description.length} bullet point{item.description.length > 1 ? 's' : ''}: {item.description[0]}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setPreviewItem(item)}
                              title="View Details"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(item)}
                              title="Duplicate Entry"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              title="Edit Entry"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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
          ) : (
            /* ============================================================ */
            /* GRID VIEW */
            /* ============================================================ */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {item.logo_url ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-1 shrink-0 relative">
                            <BlurImage
                              src={getDirectImageUrl(item.logo_url)}
                              alt={item.company}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                            <Briefcase className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
                            {item.role}
                          </h4>
                          <p className="text-xs text-sky-400 font-semibold mt-0.5">
                            {item.company}
                          </p>
                        </div>
                      </div>
                      {getCategoryBadge(item.category)}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>{formatPeriod(item.start_date, item.end_date, item.is_current)}</span>
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>

                    {item.description && item.description.length > 0 && (
                      <ul className="space-y-1.5 pt-2 text-xs text-muted-foreground/90 border-t border-slate-200/5 dark:border-slate-800/10">
                        {item.description.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-primary font-bold shrink-0 mt-1">•</span>
                            <span className="line-clamp-2">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-200/10 dark:border-slate-800/10">
                    <button
                      onClick={() => setPreviewItem(item)}
                      title="View Details"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(item)}
                      title="Duplicate Entry"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true
                      if (page === 1 || page === totalPages) return true
                      return Math.abs(page - currentPage) <= 1
                    })
                    .map((page, idx, array) => {
                      const prevPage = array[idx - 1]
                      const showEllipsis = prevPage && page - prevPage > 1

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-xs text-muted-foreground font-bold">...</span>
                          )}
                          <button
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
                        </React.Fragment>
                      )
                    })}
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

      {/* Detail Preview Modal (Read) */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {previewItem.logo_url ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-1 shrink-0 relative">
                    <BlurImage src={getDirectImageUrl(previewItem.logo_url)} alt={previewItem.company} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{previewItem.role}</h3>
                  <p className="text-sm font-semibold text-sky-400">{previewItem.company}</p>
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{formatPeriod(previewItem.start_date, previewItem.end_date, previewItem.is_current)}</span>
              </div>
              {previewItem.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{previewItem.location}</span>
                </div>
              )}
            </div>

            {previewItem.description && previewItem.description.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Key Responsibilities</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {previewItem.description.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const itemToEdit = previewItem
                  setPreviewItem(null)
                  handleEdit(itemToEdit)
                }}
                className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
