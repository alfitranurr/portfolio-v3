'use client'

import * as React from 'react'
import { 
  Terminal, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Sparkles,
  HelpCircle
} from 'lucide-react'
import { saveSkillAction, deleteSkillAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'
import { Skill } from '@/lib/types'
import {
  PythonIcon,
  SqlIcon,
  LookerIcon,
  ExcelIcon,
  TableauIcon,
  PowerBiIcon,
  NextjsIcon,
  SupabaseIcon,
  GitIcon,
  ScikitLearnIcon,
  TensorflowIcon,
  PytorchIcon
} from '@/components/icons'

interface SkillsCrudProps {
  initialSkills: Skill[]
}

const CATEGORIES = ['All', 'Language', 'Database', 'BI / Viz', 'ML / AI', 'Framework', 'Backend', 'DevOps', 'Tool']

const DEFAULT_SKILL: Omit<Skill, 'id'> = {
  name: '',
  category: 'Language',
  level: 80,
  desc: '',
  svg_path: ''
}

function getSkillIcon(name: string, customPath: string | null, className?: string) {
  if (customPath) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d={customPath} />
      </svg>
    )
  }
  switch (name.toLowerCase()) {
    case 'python':
      return <PythonIcon className={className} />
    case 'sql':
      return <SqlIcon className={className} />
    case 'looker studio':
    case 'googledatastudio':
    case 'google data studio':
    case 'datastudio':
    case 'data studio':
      return <LookerIcon className={className} />
    case 'excel':
      return <ExcelIcon className={className} />
    case 'tableau':
      return <TableauIcon className={className} />
    case 'powerbi':
    case 'power bi':
      return <PowerBiIcon className={className} />
    case 'next.js':
    case 'nextjs':
      return <NextjsIcon className={className} />
    case 'supabase':
      return <SupabaseIcon className={className} />
    case 'git':
      return <GitIcon className={className} />
    case 'scikit-learn':
    case 'scikitlearn':
      return <ScikitLearnIcon className={className} />
    case 'tensorflow':
      return <TensorflowIcon className={className} />
    case 'pytorch':
      return <PytorchIcon className={className} />
    default:
      return <Terminal className={className} />
  }
}

export function SkillsCrud({ initialSkills }: SkillsCrudProps) {
  const [skills, setSkills] = React.useState<Skill[]>(initialSkills)
  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('All')
  const [editingItem, setEditingItem] = React.useState<Partial<Skill> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    setSkills(initialSkills)
  }, [initialSkills])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('skills_admin_notification')
    if (stored) {
      try {
        setNotification(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
      sessionStorage.removeItem('skills_admin_notification')
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

  const filtered = skills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      (s.desc && s.desc.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleEdit = (item: Skill) => {
    setEditingItem({ ...item })
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
          // If we edited locally or in DB
          setSkills(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...editingItem } as Skill : item))
          sessionStorage.setItem('skills_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Interactive Tech Stack</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your technical languages, databases, tools, and visual frameworks.
          </p>
        </div>
        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tech Stack</span>
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

      {/* Edit/Create Form */}
      {editingItem && (
        <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
            <button
              onClick={() => setEditingItem(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Listing</span>
            </button>
            <h2 className="text-sm font-black uppercase tracking-wider text-primary">
              {editingItem.id ? 'Edit Tech Stack Details' : 'Add New Tech Stack'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tech Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Python, Docker, React"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Simple Icons logo path will be fetched automatically if logo field is empty.</span>
                  </span>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Category <span className="text-primary">*</span>
                  </label>
                  <select
                    value={editingItem.category || 'Language'}
                    onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-950 text-foreground">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Short Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingItem.desc || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="e.g. ML models, automation, data engineering"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Custom SVG Path */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Custom SVG Logo Path (Optional)
                    </label>
                    <div className="relative group cursor-pointer text-muted-foreground hover:text-foreground">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none leading-relaxed border border-white/10 z-10">
                        Paste the value inside the `d` attribute of your SVG icon (e.g. `M12 2C6.48...`). If left empty, it will auto-fetch based on name.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editingItem.svg_path || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, svg_path: e.target.value }))}
                    placeholder="M14.25.18l.9.2..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-[11px] font-mono focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Preview Logo */}
                {(editingItem.svg_path || editingItem.name) && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-slate-200/5 dark:border-slate-800/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-200/10 dark:border-slate-800/10">
                      {getSkillIcon(editingItem.name || '', editingItem.svg_path || null, "w-6 h-6")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Current Live Preview</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {editingItem.svg_path ? 'Custom path supplied' : 'Fallbacks to default or fetched Simple Icon'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
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
                className="py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Tech Stack...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Entry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid listing */}
      {!editingItem && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search Tech Stack..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filtered.length} entries
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
                  activeCategory === cat
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-foreground/80 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Listing Cards */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 space-y-3">
              <Terminal className="w-10 h-10 text-muted-foreground/40 mx-auto animate-pulse" />
              <h3 className="font-extrabold text-foreground">No Tech Stack found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No items match your query. Click "Add Tech Stack" above to insert your first record.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((skill) => (
                <div
                  key={skill.id}
                  className="group p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/10 dark:border-slate-800/10 text-slate-700 dark:text-slate-300 flex items-center justify-center w-10 h-10 transition-all group-hover:border-primary/20">
                        {getSkillIcon(skill.name, skill.svg_path, "w-5.5 h-5.5")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                            {skill.name}
                          </h3>
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground text-[8px] font-black uppercase tracking-wider">
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-normal">
                          {skill.desc || 'No description supplied.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-200/5 dark:border-slate-800/5 mt-4">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="py-1 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
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
