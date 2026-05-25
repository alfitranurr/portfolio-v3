'use client'

import * as React from 'react'
import { 
  GraduationCap, 
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
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react'
import { saveEducationAction, deleteEducationAction, uploadAssetAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'

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
  start_date: '',
  end_date: '',
  gpa: null,
  description: '',
  logo_url: ''
}

export function EducationCrud({ initialEducation }: EducationCrudProps) {
  const [educationList, setEducationList] = React.useState<Education[]>(initialEducation)
  const [search, setSearch] = React.useState('')
  const [editingItem, setEditingItem] = React.useState<Partial<Education> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

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
    } catch (err: any) {
      console.error(err)
      setNotification({ success: false, message: 'Error uploading logo.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setEditingItem(prev => ({ ...prev, logo_url: null }))
  }

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

  const filtered = educationList.filter(e => 
    e.institution.toLowerCase().includes(search.toLowerCase()) ||
    e.degree.toLowerCase().includes(search.toLowerCase()) ||
    (e.field_of_study || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (item: Education) => {
    // Format dates to YYYY-MM-DD for date inputs
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
    if (confirm('Delete this education entry?')) {
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
      const res = await saveEducationAction(editingItem)
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Education History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Display your academic credentials and coursework timeline.
          </p>
        </div>
        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Education</span>
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
              {editingItem.id ? 'Edit Education Entry' : 'Add Academic Entry'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Core Fields */}
              <div className="space-y-4">
                {/* Institution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Institution Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.institution || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="e.g. University of Indonesia"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Degree */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Degree Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.degree || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="e.g. Bachelor of Science"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Field of Study */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Field of Study / Major
                  </label>
                  <input
                    type="text"
                    value={editingItem.field_of_study || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, field_of_study: e.target.value }))}
                    placeholder="e.g. Information Systems"
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
                    value={editingItem.location || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Jakarta, Indonesia"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Logo Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Institution Logo (Upload or URL)
                  </label>
                  
                  <div className="flex items-center gap-4">
                    {/* Preview box */}
                    <div className="relative group w-14 h-14 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 bg-slate-200/5 flex items-center justify-center shrink-0">
                      {editingItem.logo_url ? (
                        <>
                          <img
                            src={getDirectImageUrl(editingItem.logo_url, 200)}
                            alt="Logo preview"
                            className="w-full h-full object-contain p-1 bg-white"
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
                            <span>{editingItem.logo_url ? 'Change Logo File' : 'Upload Logo File'}</span>
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
                        value={editingItem.logo_url || ''}
                        onChange={e => setEditingItem(prev => ({ ...prev, logo_url: e.target.value }))}
                        placeholder="Or paste Logo Image URL (e.g. Google Drive link)"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-[11px] focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Time frame & GPA */}
              <div className="space-y-4">
                {/* Dates Grid */}
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
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editingItem.end_date || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, end_date: e.target.value }))}
                      placeholder="Present"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* GPA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Grade / GPA (e.g. 3.92)
                  </label>
                  <input
                    type="text"
                    value={editingItem.gpa ?? ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, gpa: e.target.value || null }))}
                    placeholder="e.g. 3.92, 4.00/4.00, or 85.09/100"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Activity Description & Honors
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.description || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Activities, achievements, or specialized courses..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 resize-none"
                  />
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

      {/* Grid listing */}
      {!editingItem && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search schools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filtered.length} entries
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 space-y-3">
              <GraduationCap className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-extrabold text-foreground">No education history found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Add an entry using the Add Education button above to populate the timeline.
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
                    <div className="flex items-start gap-3.5">
                      {item.logo_url && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0 border border-slate-200/10 p-1">
                          <img 
                            src={getDirectImageUrl(item.logo_url, 100)} 
                            alt={item.institution} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-black text-sm md:text-base leading-tight text-foreground truncate">
                              {item.institution}
                            </h3>
                            <p className="text-xs text-primary font-bold mt-1">
                              {item.degree} {item.field_of_study ? `in ${item.field_of_study}` : ''}
                            </p>
                          </div>
                          {item.gpa && (
                            <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black tracking-wide shrink-0">
                              GPA: {item.gpa}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground font-semibold pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.start_date).getFullYear()} - {item.end_date ? new Date(item.end_date).getFullYear() : 'Present'}
                        </span>
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pt-1 border-t border-slate-200/5 dark:border-slate-800/5">
                        {item.description}
                      </p>
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
