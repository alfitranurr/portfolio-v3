'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Sparkles,
  UploadCloud,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  X
} from 'lucide-react'
import { saveSkillAction, deleteSkillAction, uploadAssetAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { Skill } from '@/lib/types'
import { BlurImage } from '@/components/ui/blur-image'
import { CustomSortDropdown } from '@/components/ui/custom-sort-dropdown'

interface SkillsCrudProps {
  initialSkills: Skill[]
}

const CATEGORIES = ['All', 'Data Analytics', 'Machine Learning', 'Web & Automation', 'Database & Cloud']

const DEFAULT_SKILL: Omit<Skill, 'id'> = {
  name: '',
  category: 'Data Analytics',
  desc: '',
  level: 85,
  svg_path: null,
  logo_url: ''
}

type ViewMode = 'table' | 'grid'
type SortField = 'name' | 'level' | 'category'

export function SkillsCrud({ initialSkills }: SkillsCrudProps) {
  const [skills, setSkills] = React.useState<Skill[]>(initialSkills)
  const [prevInitialSkills, setPrevInitialSkills] = React.useState(initialSkills)

  if (initialSkills !== prevInitialSkills) {
    setPrevInitialSkills(initialSkills)
    setSkills(initialSkills)
  }

  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('All')
  const [viewMode, setViewMode] = React.useState<ViewMode>('table')
  const [sortField, setSortField] = React.useState<SortField>('level')

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const [editingItem, setEditingItem] = React.useState<Partial<Skill> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const stored = sessionStorage.getItem('skills_admin_notification')
      if (stored) {
        try {
          setNotification(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
        sessionStorage.removeItem('skills_admin_notification')
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
      formData.append('prefix', 'skill-logo')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        setEditingItem(prev => prev ? ({ ...prev, logo_url: res.url }) : null)
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

  const renderIcon = (skill: Skill, className = "w-5 h-5") => {
    if (skill.logo_url) {
      return (
        <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-slate-900 border border-slate-700/60 p-0.5 shadow-xs", className)}>
          <BlurImage
            src={getDirectImageUrl(skill.logo_url)}
            alt={skill.name}
            className="w-full h-full object-contain"
          />
        </div>
      )
    }
    return <Terminal className={cn("text-primary shrink-0", className)} />
  }

  // Filter & Sort
  const filteredAndSorted = React.useMemo(() => {
    const result = skills.filter(s => {
      const q = search.toLowerCase()
      const matchesSearch = 
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.desc && s.desc.toLowerCase().includes(q))
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory
      return matchesSearch && matchesCategory
    })

    result.sort((a, b) => {
      if (sortField === 'level') {
        return (b.level || 0) - (a.level || 0)
      }
      if (sortField === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortField === 'category') {
        return a.category.localeCompare(b.category)
      }
      return 0
    })

    return result
  }, [skills, search, activeCategory, sortField])

  // Pagination calculations
  const totalItems = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

  const [previewItem, setPreviewItem] = React.useState<Skill | null>(null)

  const handleEdit = (item: Skill) => {
    setEditingItem({ ...item })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDuplicate = (item: Skill) => {
    setEditingItem({
      ...item,
      id: undefined,
      name: `${item.name} (Copy)`
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingItem({ ...DEFAULT_SKILL })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Tech Stack?')) {
      setIsPending(true)
      try {
        const res = await deleteSkillAction(id)
        if (res.success) {
          setSkills(prev => prev.filter(s => s.id !== id))
          setNotification({ success: true, message: 'Tech Stack deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete Tech Stack.' })
        }
      } catch (err) {
        console.error(err)
        setNotification({ success: false, message: 'Error deleting Tech Stack.' })
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem?.name || !editingItem?.category) {
      alert('Name and Category are required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await saveSkillAction(editingItem)
      if (res.success) {
        if (editingItem.id) {
          setSkills(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...editingItem } as Skill : item))
        } else {
          sessionStorage.setItem('skills_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingItem(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save Tech Stack.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving Tech Stack.' })
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
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Interactive Tech Stack
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Manage your technical programming languages, databases, tools, machine learning libraries, and frameworks.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="group py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 shrink-0 self-start sm:self-center z-10"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Tech Stack</span>
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
                {editingItem.id ? 'Edit Tech Stack Skill' : 'Add New Skill Tool'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Skill Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Python / n8n / PostgreSQL"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Category <span className="text-primary">*</span>
                  </label>
                  <select
                    value={editingItem.category || 'Data Analytics'}
                    onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Web & Automation">Web & Automation</option>
                    <option value="Database & Cloud">Database & Cloud</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Proficiency / Level ({editingItem.level || 85}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={editingItem.level || 85}
                    onChange={e => setEditingItem(prev => ({ ...prev, level: Number(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Custom Logo Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingItem.logo_url || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="e.g. /images/n8n-logo.png"
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

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Short Description
              </label>
              <textarea
                rows={2}
                value={editingItem.desc || ''}
                onChange={e => setEditingItem(prev => ({ ...prev, desc: e.target.value }))}
                placeholder="e.g. Workflow automation, webhook integrations, and REST API orchestration..."
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
                    <span>Saving Skill...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Skill Entry</span>
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
                  placeholder="Search skills by name or description..."
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
                {/* Sort Selector */}
                <CustomSortDropdown
                  value={sortField}
                  onChange={val => {
                    setSortField(val as SortField)
                    setCurrentPage(1)
                  }}
                  options={[
                    { label: 'Highest Level', value: 'level' },
                    { label: 'Name (A-Z)', value: 'name' },
                    { label: 'Category (A-Z)', value: 'category' },
                  ]}
                />

                {/* View Switcher */}
                <div className="flex items-center p-1 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-slate-700/60 shadow-2xs">
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

            {/* Bottom Row: Category Tabs */}
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
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                Showing {paginatedItems.length} of {totalItems} {totalItems === 1 ? 'skill' : 'skills'}
              </span>
            </div>
          </div>

          {/* Empty State */}
          {filteredAndSorted.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
              <Terminal className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-extrabold text-foreground text-base">No tech stack skills found</h3>
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
                      <th className="py-2.5 px-3 w-1/4">Skill Name</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Category</th>
                      <th className="py-2.5 px-3 w-32">Proficiency</th>
                      <th className="py-2.5 px-3">Description</th>
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

                        {/* Skill Name & Icon */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {renderIcon(item, "w-5 h-5")}
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1">
                                {item.name}
                              </h4>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-[10px] font-bold text-muted-foreground">
                            {item.category}
                          </span>
                        </td>

                        {/* Proficiency */}
                        <td className="py-2.5 px-3">
                          <div className="space-y-1 w-full max-w-[120px]">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-muted-foreground">Mastery</span>
                              <span className="text-primary">{item.level || 85}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full"
                                style={{ width: `${item.level || 85}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-2.5 px-3">
                          <p className="text-[10px] text-muted-foreground/80 line-clamp-1">
                            {item.desc || '-'}
                          </p>
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
                              title="Duplicate Skill"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              title="Edit Skill"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="Delete Skill"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  transition={{ layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                  className="p-4 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {renderIcon(item, "w-7 h-7")}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground/60">
                        {item.category}
                      </p>
                    </div>
                    {item.desc && (
                      <p className="text-[10px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/5 dark:border-slate-800/10">
                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.level || 85}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground font-bold">{item.level || 85}%</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewItem(item)}
                          title="View Details"
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          title="Duplicate Skill"
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-amber-400 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit Skill"
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-foreground cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete Skill"
                          className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
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

      {/* Detail Preview Modal (Read) */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {renderIcon(previewItem, "w-8 h-8")}
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{previewItem.name}</h3>
                  <p className="text-xs font-semibold text-sky-400">{previewItem.category}</p>
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs border-y border-slate-800 py-3">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-xs">
                  <span className="text-muted-foreground">Mastery Level</span>
                  <span className="text-primary">{previewItem.level || 85}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${previewItem.level || 85}%` }} />
                </div>
              </div>

              {previewItem.desc && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
                  <p className="text-slate-300 leading-relaxed">{previewItem.desc}</p>
                </div>
              )}
            </div>

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
                <span>Edit Tech Stack</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
