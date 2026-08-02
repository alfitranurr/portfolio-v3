'use client'

import * as React from 'react'
import { 
  GraduationCap, 
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
  UploadCloud,
  Image as ImageIcon,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react'
import { saveEducationAction, deleteEducationAction, uploadAssetAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'

interface Education {
  id: string
  institution: string
  degree: string
  field_of_study: string | null
  location: string | null
  start_date: string
  end_date: string | null
  gpa: string | null
  description: string | null
  logo_url?: string | null
  created_at?: string
  updated_at?: string
}

interface EducationCrudProps {
  initialEducation: Education[]
}

const DEFAULT_EDUCATION: Omit<Education, 'id'> = {
  institution: '',
  degree: '',
  field_of_study: '',
  location: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  gpa: null,
  description: '',
  logo_url: ''
}

type ViewMode = 'table' | 'grid'
type SortField = 'newest' | 'oldest' | 'institution' | 'degree'

export function EducationCrud({ initialEducation }: EducationCrudProps) {
  const [educationList, setEducationList] = React.useState<Education[]>(initialEducation)
  const [search, setSearch] = React.useState('')
  const [viewMode, setViewMode] = React.useState<ViewMode>('table')
  const [sortField, setSortField] = React.useState<SortField>('newest')

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const [editingItem, setEditingItem] = React.useState<Partial<Education> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    setEducationList(initialEducation)
  }, [initialEducation])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('education_admin_notification')
    if (stored) {
      try {
        setNotification(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
      sessionStorage.removeItem('education_admin_notification')
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

  const handleRemoveLogo = () => {
    setEditingItem(prev => ({ ...prev, logo_url: null }))
  }

  // Filter and Sort logic
  const filteredAndSorted = React.useMemo(() => {
    let result = educationList.filter(e => {
      const q = search.toLowerCase()
      return (
        e.institution.toLowerCase().includes(q) ||
        e.degree.toLowerCase().includes(q) ||
        (e.field_of_study || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q)
      )
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      }
      if (sortField === 'institution') {
        return a.institution.localeCompare(b.institution)
      }
      if (sortField === 'degree') {
        return a.degree.localeCompare(b.degree)
      }
      return 0
    })

    return result
  }, [educationList, search, sortField])

  // Reset to page 1 whenever search/pageSize changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, pageSize, sortField])

  // Pagination calculations
  const totalItems = filteredAndSorted.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

  const handleEdit = (item: Education) => {
    const start_date = item.start_date ? item.start_date.split('T')[0] : ''
    const end_date = item.end_date ? item.end_date.split('T')[0] : ''
    setEditingItem({ ...item, start_date, end_date })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingItem({ ...DEFAULT_EDUCATION })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this education entry?')) {
      setIsPending(true)
      try {
        const res = await deleteEducationAction(id)
        if (res.success) {
          setEducationList(prev => prev.filter(e => e.id !== id))
          setNotification({ success: true, message: 'Education deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete education.' })
        }
      } catch (err) {
        console.error(err)
        setNotification({ success: false, message: 'Error deleting education.' })
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem?.institution || !editingItem?.degree || !editingItem?.start_date) {
      alert('Institution, Degree, and Start Date are required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await saveEducationAction(editingItem as Education)
      if (res.success) {
        if (editingItem.id) {
          setEducationList(prev => prev.map(item => item.id === editingItem.id ? ((res.message || '').includes('Mock') ? { ...item, ...editingItem } as Education : editingItem as Education) : item))
        } else {
          sessionStorage.setItem('education_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingItem(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save education.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving education.' })
    } finally {
      setIsPending(false)
    }
  }

  const formatPeriod = (startStr: string, endStr: string | null) => {
    if (!startStr) return '-'
    const startYear = new Date(startStr).getFullYear()
    if (!endStr) return `${startYear} - Present`
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
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Education History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Display and manage your academic credentials, degrees, and coursework timeline.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="group py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 shrink-0 self-start sm:self-center z-10"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Education</span>
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

      {/* Edit Form */}
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
                {editingItem.id ? 'Edit Academic Record' : 'Add New Education Entry'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Institution Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.institution || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="e.g. University of Muhammadiyah Malang"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Degree / Qualification <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.degree || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="e.g. Bachelor of Engineering (S.T.)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={editingItem.field_of_study || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, field_of_study: e.target.value }))}
                    placeholder="e.g. Electrical Engineering / Data Science"
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
                      End Date / Graduation
                    </label>
                    <input
                      type="date"
                      value={editingItem.end_date || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      GPA / Grade
                    </label>
                    <input
                      type="text"
                      value={editingItem.gpa || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, gpa: e.target.value }))}
                      placeholder="e.g. 3.85 / 4.00"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingItem.location || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Malang, Indonesia"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Institution Logo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingItem.logo_url || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="e.g. /images/umm-logo.png"
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

            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Highlights & Activities Description
              </label>
              <textarea
                rows={3}
                value={editingItem.description || ''}
                onChange={e => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Key achievements, honors, relevant coursework, thesis..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
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
                    <span>Save Academic Entry</span>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Search by institution, degree, or field of study..."
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

              {/* Controls Group */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Sort Selector */}
                <CustomSortDropdown
                  value={sortField}
                  onChange={setSortField}
                  options={[
                    { label: 'Newest First', value: 'newest' },
                    { label: 'Oldest First', value: 'oldest' },
                    { label: 'Institution (A-Z)', value: 'institution' },
                    { label: 'Degree (A-Z)', value: 'degree' },
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

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
              <span className="text-xs font-semibold text-muted-foreground">
                Academic Records Catalog
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Showing {paginatedItems.length} of {totalItems} {totalItems === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          </div>

          {/* Empty State */}
          {filteredAndSorted.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
              <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-extrabold text-foreground text-base">No education entries found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No entries matched &quot;{search}&quot;. Try adjusting your search query.
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* ============================================================ */
            /* TABLE VIEW */
            /* ============================================================ */
            <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm relative z-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4 min-w-[240px]">Institution & Degree</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Period</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">GPA</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Location & Details</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
                    {paginatedItems.map((item, index) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-slate-500/5 transition-colors group"
                      >
                        {/* Index */}
                        <td className="py-3.5 px-4 text-center text-muted-foreground/60 font-mono text-[11px]">
                          {startIndex + index + 1}
                        </td>

                        {/* Institution & Degree */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {item.logo_url ? (
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative p-1 shadow-xs">
                                <BlurImage
                                  src={getDirectImageUrl(item.logo_url)}
                                  alt={item.institution}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                            )}
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={item.degree}>
                                {item.degree}
                              </h4>
                              <p className="text-[11px] text-sky-400 font-semibold line-clamp-1" title={item.institution}>
                                {item.institution}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Period */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                            <span>{formatPeriod(item.start_date, item.end_date)}</span>
                          </div>
                        </td>

                        {/* GPA */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.gpa ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              <Award className="w-3 h-3" />
                              <span>GPA: {item.gpa}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50 text-[11px]">-</span>
                          )}
                        </td>

                        {/* Location & Details */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {item.location && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                <span className="truncate max-w-[180px]">{item.location}</span>
                              </div>
                            )}
                            {item.description && (
                              <p className="text-[10px] text-muted-foreground/70 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
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
                              alt={item.institution}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
                            {item.degree}
                          </h4>
                          <p className="text-xs text-sky-400 font-semibold mt-0.5">
                            {item.institution}
                          </p>
                        </div>
                      </div>
                      {item.gpa && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          GPA: {item.gpa}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>{formatPeriod(item.start_date, item.end_date)}</span>
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-3 pt-2 border-t border-slate-200/5 dark:border-slate-800/10 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/10 dark:border-slate-800/10">
                    <button
                      onClick={() => handleEdit(item)}
                      className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer"
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
                  onChange={e => setPageSize(Number(e.target.value))}
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
