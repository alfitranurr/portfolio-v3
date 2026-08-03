'use client'

import * as React from 'react'
import { 
  Award, 
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
  ExternalLink,
  ArrowLeft,
  FileCheck,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Eye,
  Copy
} from 'lucide-react'
import { saveCertificateAction, deleteCertificateAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'

interface Certificate {
  id: string
  title: string
  issuer: string
  issue_date: string
  credential_url: string | null
  credential_id: string | null
  category: 'competition' | 'seminar_workshop' | 'license_certification' | 'committee_organization'
  image_url: string | null
  created_at?: string
  updated_at?: string
}

interface CertificatesCrudProps {
  initialCertificates: Certificate[]
}

const CATEGORY_MAP: Record<string, string> = {
  All: 'All Credentials',
  competition: 'Competitions',
  seminar_workshop: 'Seminars & Workshops',
  license_certification: 'Licenses & Certifications',
  committee_organization: 'Work & Organizations',
}

const CATEGORIES = ['All', 'competition', 'seminar_workshop', 'license_certification', 'committee_organization']

const DEFAULT_CERTIFICATE: Omit<Certificate, 'id'> = {
  title: '',
  issuer: '',
  issue_date: new Date().toISOString().split('T')[0],
  credential_url: '',
  credential_id: '',
  category: 'license_certification',
  image_url: ''
}

type ViewMode = 'table' | 'grid'
type SortField = 'newest' | 'oldest' | 'title' | 'issuer'

export function CertificatesCrud({ initialCertificates }: CertificatesCrudProps) {
  const [certificates, setCertificates] = React.useState<Certificate[]>(initialCertificates)
  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('All')
  const [viewMode, setViewMode] = React.useState<ViewMode>('table')
  const [sortField, setSortField] = React.useState<SortField>('newest')
  
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const [editingItem, setEditingItem] = React.useState<Partial<Certificate> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    setCertificates(initialCertificates)
  }, [initialCertificates])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('certificate_admin_notification')
    if (stored) {
      try {
        setNotification(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
      sessionStorage.removeItem('certificate_admin_notification')
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

  // Filter and Sort logic
  const filteredAndSorted = React.useMemo(() => {
    let result = certificates.filter(c => {
      const q = search.toLowerCase()
      const matchesSearch = 
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        (c.credential_id && c.credential_id.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
      const matchesCategory = activeCategory === 'All' || c.category === activeCategory
      return matchesSearch && matchesCategory
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
      }
      if (sortField === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortField === 'issuer') {
        return a.issuer.localeCompare(b.issuer)
      }
      return 0
    })

    return result
  }, [certificates, search, activeCategory, sortField])

  // Reset to page 1 whenever search, category or pageSize changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, activeCategory, pageSize, sortField])

  // Pagination calculation
  const totalItems = filteredAndSorted.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

  const [previewItem, setPreviewItem] = React.useState<Certificate | null>(null)

  const handleEdit = (item: Certificate) => {
    const issue_date = item.issue_date ? item.issue_date.split('T')[0] : ''
    setEditingItem({ ...item, issue_date })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDuplicate = (item: Certificate) => {
    const issue_date = item.issue_date ? item.issue_date.split('T')[0] : ''
    setEditingItem({
      ...item,
      id: undefined,
      title: `${item.title} (Copy)`,
      issue_date
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingItem({ ...DEFAULT_CERTIFICATE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this certificate entry?')) {
      setIsPending(true)
      try {
        const res = await deleteCertificateAction(id)
        if (res.success) {
          setCertificates(prev => prev.filter(c => c.id !== id))
          setNotification({ success: true, message: 'Certificate deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete certificate.' })
        }
      } catch (err) {
        console.error(err)
        setNotification({ success: false, message: 'Error occurred while deleting.' })
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem?.title || !editingItem?.issuer || !editingItem?.issue_date || !editingItem?.category) {
      alert('Title, Issuer, Issue Date, and Category are required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await saveCertificateAction(editingItem)
      if (res.success) {
        if (editingItem.id) {
          setCertificates(prev => prev.map(item => item.id === editingItem.id ? ((res.message || '').includes('Mock') ? { ...item, ...editingItem } as Certificate : editingItem as Certificate) : item))
        } else {
          sessionStorage.setItem('certificate_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingItem(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save certificate.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving certificate.' })
    } finally {
      setIsPending(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'competition':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
            <Award className="w-3 h-3" />
            <span>Competition</span>
          </span>
        )
      case 'seminar_workshop':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>Workshop & Seminar</span>
          </span>
        )
      case 'license_certification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
            <ShieldCheck className="w-3 h-3" />
            <span>License & Cert</span>
          </span>
        )
      case 'committee_organization':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
            <FileCheck className="w-3 h-3" />
            <span>Organization</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-500/10 text-muted-foreground border border-slate-500/20 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
            {category}
          </span>
        )
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
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
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Certifications & Awards
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Manage your verified credentials, competition standings, and professional certifications.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="group py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 shrink-0 self-start sm:self-center z-10"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add New Certificate</span>
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
                {editingItem.id ? 'Edit Certificate Entry' : 'Create New Certificate'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Certificate Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Professional Data Scientist Certification"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Issuer <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.issuer || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="e.g. BNSP (National Certification Board)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Credential Category <span className="text-primary">*</span>
                  </label>
                  <select
                    value={editingItem.category || 'license_certification'}
                    onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="competition">Competition Award</option>
                    <option value="seminar_workshop">Seminar & Workshop</option>
                    <option value="license_certification">License & Certification</option>
                    <option value="committee_organization">Work & Organization</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Credential ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingItem.credential_id || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, credential_id: e.target.value }))}
                    placeholder="e.g. BNSP-DS-7718A"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Issue Date <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editingItem.issue_date || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, issue_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Credential URL / Verification Link
                  </label>
                  <input
                    type="url"
                    value={editingItem.credential_url || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, credential_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Image URL / File Link
                  </label>
                  <input
                    type="text"
                    value={editingItem.image_url || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="e.g. /images/certificates/bnsp.png or https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Preview Thumbnail if image_url provided */}
                {editingItem.image_url && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-16 h-10 rounded-lg overflow-hidden relative shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                      <BlurImage
                        src={getDirectImageUrl(editingItem.image_url)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      Image preview active
                    </span>
                  </div>
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
                  placeholder="Search by title, issuer, or credential ID..."
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
                {/* Sort Field Selector */}
                <CustomSortDropdown
                  value={sortField}
                  onChange={setSortField}
                  options={[
                    { label: 'Newest First', value: 'newest' },
                    { label: 'Oldest First', value: 'oldest' },
                    { label: 'Title (A-Z)', value: 'title' },
                    { label: 'Issuer (A-Z)', value: 'issuer' },
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
                    onClick={() => setActiveCategory(cat)}
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
              <Award className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-extrabold text-foreground text-base">No certificates found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No entries matched &quot;{search}&quot;. Try adjusting your search term or category filters.
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
                      <th className="py-3.5 px-4 min-w-[280px]">Certificate Title & Issuer</th>
                      <th className="py-3.5 px-4 whitespace-nowrap text-center">Category</th>
                      <th className="py-3.5 px-4 whitespace-nowrap text-center">Issue Date</th>
                      <th className="py-3.5 px-4 whitespace-nowrap text-center">Credential ID</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
                    {paginatedItems.map((cert, index) => (
                      <tr 
                        key={cert.id}
                        className="hover:bg-slate-500/5 transition-colors group"
                      >
                        {/* Index / Number */}
                        <td className="py-3.5 px-4 text-center text-muted-foreground/60 font-mono text-[11px]">
                          {startIndex + index + 1}
                        </td>

                        {/* Title & Issuer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {cert.image_url ? (
                              <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative shadow-xs">
                                <BlurImage
                                  src={getDirectImageUrl(cert.image_url)}
                                  alt={cert.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                                <Award className="w-4 h-4" />
                              </div>
                            )}
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={cert.title}>
                                {cert.title}
                              </h4>
                              <p className="text-[11px] text-muted-foreground font-medium line-clamp-1" title={cert.issuer}>
                                {cert.issuer}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {getCategoryBadge(cert.category)}
                          </div>
                        </td>

                        {/* Issue Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-muted-foreground text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                            <span>{formatDate(cert.issue_date)}</span>
                          </div>
                        </td>

                        {/* Credential ID */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          {cert.credential_id ? (
                            <span 
                              className="font-mono text-[10px] px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-300 inline-block tracking-tight max-w-[180px] truncate"
                              title={cert.credential_id}
                            >
                              {cert.credential_id}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/30 text-[10px] italic">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setPreviewItem(cert)}
                              title="View Details"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(cert)}
                              title="Duplicate Entry"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {(cert.credential_url || cert.image_url) && (
                              <a
                                href={cert.credential_url || cert.image_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View External Credential"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleEdit(cert)}
                              title="Edit Entry"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cert.id)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {getCategoryBadge(cert.category)}
                      <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-muted-foreground/60" />
                        {formatDate(cert.issue_date)}
                      </span>
                    </div>

                    {cert.image_url ? (
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-2">
                        <BlurImage 
                          src={getDirectImageUrl(cert.image_url)} 
                          alt={cert.title} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <Award className="w-10 h-10 text-primary/40" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2" title={cert.title}>
                        {cert.title}
                      </h4>
                      <p className="text-xs text-sky-400 font-semibold truncate" title={cert.issuer}>
                        {cert.issuer}
                      </p>
                    </div>

                    {cert.credential_id && (
                      <div className="pt-1">
                        <span 
                          className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-300 inline-block tracking-tight max-w-full truncate"
                          title={cert.credential_id}
                        >
                          ID: {cert.credential_id}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/10 dark:border-slate-800/10">
                    <div>
                      {(cert.credential_url || cert.image_url) && (
                        <a
                          href={cert.credential_url || cert.image_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                        >
                          <span>View Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewItem(cert)}
                        title="View Details"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(cert)}
                        title="Duplicate Entry"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(cert)}
                        className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10">
              {/* Page size selector */}
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

              {/* Navigation buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Buttons */}
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
                {previewItem.image_url ? (
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                    <BlurImage src={getDirectImageUrl(previewItem.image_url)} alt={previewItem.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{previewItem.title}</h3>
                  <p className="text-sm font-semibold text-sky-400">{previewItem.issuer}</p>
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground border-y border-slate-800 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{formatDate(previewItem.issue_date)}</span>
                </div>
                {getCategoryBadge(previewItem.category)}
              </div>
              {previewItem.credential_id && (
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-muted-foreground/60">Credential ID:</span>
                  <span className="text-amber-400 font-bold">{previewItem.credential_id}</span>
                </div>
              )}
            </div>

            {previewItem.credential_url && (
              <div className="pt-1">
                <a
                  href={previewItem.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify Credential Online</span>
                </a>
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
