'use client'

import * as React from 'react'
import { 
  Briefcase, 
  Plus, 
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
  ChevronDown
} from 'lucide-react'
import { saveExperienceAction, deleteExperienceAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

interface Experience {
  id: string
  role: string
  company: string
  location: string | null
  start_date: string
  end_date: string | null
  description: string[]
  is_current: boolean | null
  created_at?: string
  updated_at?: string
}

interface ExperienceCrudProps {
  initialExperience: Experience[]
}

const DEFAULT_EXPERIENCE: Omit<Experience, 'id'> = {
  role: '',
  company: '',
  location: '',
  start_date: '',
  end_date: '',
  description: [],
  is_current: false
}

export function ExperienceCrud({ initialExperience }: ExperienceCrudProps) {
  const [experienceList, setExperienceList] = React.useState<Experience[]>(initialExperience)
  const [search, setSearch] = React.useState('')
  const [editingItem, setEditingItem] = React.useState<Partial<Experience> | null>(null)
  const [descriptionBullets, setDescriptionBullets] = React.useState<string[]>([])
  const [isPending, setIsPending] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  React.useEffect(() => {
    setExperienceList(initialExperience)
  }, [initialExperience])

  const filtered = experienceList.filter(e => 
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.company.toLowerCase().includes(search.toLowerCase()) ||
    (e.location || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (item: Experience) => {
    const start_date = item.start_date ? item.start_date.split('T')[0] : ''
    const end_date = item.end_date ? item.end_date.split('T')[0] : ''
    setEditingItem({ ...item, start_date, end_date })
    setDescriptionBullets(item.description || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingItem({ ...DEFAULT_EXPERIENCE })
    setDescriptionBullets([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddBullet = () => {
    setDescriptionBullets(prev => [...prev, ''])
  }

  const handleUpdateBullet = (index: number, val: string) => {
    setDescriptionBullets(prev => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  const handleRemoveBullet = (index: number) => {
    setDescriptionBullets(prev => prev.filter((_, i) => i !== index))
  }

  const handleMoveBullet = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === descriptionBullets.length - 1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    setDescriptionBullets(prev => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      return next
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this experience entry?')) {
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
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem?.role || !editingItem?.company || !editingItem?.start_date) {
      alert('Role, Company, and Start Date are required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    // Filter and clean bullet points
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Work Experiences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish your employment timeline, leadership roles, and research projects.
          </p>
        </div>
        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
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

      {/* Edit Form */}
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
              {editingItem.id ? 'Edit Experience Details' : 'Add Experience Entry'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Role details */}
              <div className="space-y-4">
                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Job Title / Role <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.role || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Data Scientist Lead"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Company Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.company || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Astra International"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Jakarta, Indonesia"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
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
                      value={editingItem.start_date || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-900 border border-slate-200/10 dark:border-slate-800/10 text-foreground text-sm focus:outline-none focus:border-primary/50"
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
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-900 border border-slate-200/10 dark:border-slate-800/10 text-foreground text-sm focus:outline-none focus:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Current Switch */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={!!editingItem.is_current}
                    onChange={e => {
                      const isChecked = e.target.checked
                      setEditingItem(prev => prev ? ({
                        ...prev,
                        is_current: isChecked,
                        end_date: isChecked ? null : (prev.end_date || null)
                      }) : null)
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-200/20 dark:border-slate-800/15"
                  />
                  <label htmlFor="is_current" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                    Currently Employed in this Role
                  </label>
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="space-y-4 flex flex-col h-full">
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4 text-primary" />
                      <span>Responsibilities</span>
                    </label>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {descriptionBullets.length} points
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 flex-1">
                    {descriptionBullets.length === 0 ? (
                      <div className="text-center py-8 rounded-xl border border-dashed border-slate-200/5 dark:border-slate-800/5 bg-white/5">
                        <p className="text-xs text-muted-foreground">No responsibilities added yet.</p>
                      </div>
                    ) : (
                      descriptionBullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground/50 w-5 text-right shrink-0">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={e => handleUpdateBullet(idx, e.target.value)}
                            placeholder="e.g. Optimized operational ETL pipelines..."
                            className="flex-grow px-3 py-2 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveBullet(idx, 'up')}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all disabled:opacity-20 disabled:pointer-events-none"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === descriptionBullets.length - 1}
                              onClick={() => handleMoveBullet(idx, 'down')}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all disabled:opacity-20 disabled:pointer-events-none"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(idx)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-all"
                              title="Delete Point"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="w-full py-2 border border-dashed border-slate-200/15 dark:border-slate-800/15 hover:border-primary/40 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-all bg-white/5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Responsibility Point</span>
                  </button>
                </div>
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
                    <span>Saving...</span>
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

      {/* Listing Grid */}
      {!editingItem && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filtered.length} entries
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 space-y-3">
              <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-extrabold text-foreground">No experience history found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Add an entry using the Add Experience button above to populate the timeline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-sm md:text-base leading-tight text-foreground">
                          {item.role}
                        </h3>
                        <p className="text-xs text-primary font-bold mt-1">
                          {item.company}
                        </p>
                      </div>
                      {item.is_current && (
                        <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black tracking-wide shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground font-semibold pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.start_date).getFullYear()} - {item.is_current ? 'Present' : item.end_date ? new Date(item.end_date).getFullYear() : 'Present'}
                        </span>
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>

                    {item.description && item.description.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-1.5 pt-2 border-t border-slate-200/5 dark:border-slate-800/5 list-disc list-inside">
                        {item.description.map((bullet, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/5 dark:border-slate-800/5 mt-4">
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
        </div>
      )}
    </div>
  )
}
