'use client'

import * as React from 'react'
import { 
  Award, 
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
  ExternalLink,
  ArrowLeft,
  FileCheck
} from 'lucide-react'
import { saveCertificateAction, deleteCertificateAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'

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

const CATEGORY_MAP = {
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
  issue_date: '',
  credential_url: '',
  credential_id: '',
  category: 'license_certification',
  image_url: ''
}

export function CertificatesCrud({ initialCertificates }: CertificatesCrudProps) {
  const [certificates, setCertificates] = React.useState<Certificate[]>(initialCertificates)
  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('All')
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

  const filtered = certificates.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleEdit = (item: Certificate) => {
    const issue_date = item.issue_date ? item.issue_date.split('T')[0] : ''
    setEditingItem({ ...item, issue_date })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setEditingItem({ ...DEFAULT_CERTIFICATE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this certificate entry?')) {
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'competition': return 'Competition Award'
      case 'seminar_workshop': return 'Seminar & Workshop'
      case 'license_certification': return 'License & Certification'
      case 'committee_organization': return 'Work & Organization'
      default: return category
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Certifications & Awards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish verified credentials, hackathon standings, and workshop completions.
          </p>
        </div>
        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Certificate</span>
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
              {editingItem.id ? 'Edit Certificate Details' : 'Add New Certificate'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Title */}
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Issuer */}
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Credential Category <span className="text-primary">*</span>
                  </label>
                  <select
                    value={editingItem.category || 'license_certification'}
                    onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-900 border border-slate-200/10 dark:border-slate-800/10 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="competition">Competition Award</option>
                    <option value="seminar_workshop">Seminar & Workshop</option>
                    <option value="license_certification">License & Certification</option>
                    <option value="committee_organization">Work & Organization</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Issue Date <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editingItem.issue_date || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, issue_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-900 border border-slate-200/10 dark:border-slate-800/10 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Credential ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={editingItem.credential_id || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, credential_id: e.target.value }))}
                    placeholder="BNSP-DS-7718A"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Image URL preview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Certificate Image URL
                  </label>
                  <input
                    type="text"
                    value={editingItem.image_url || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="/images/bnsp-certificate.jpg"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50"
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

      {/* Grid view listing */}
      {!editingItem && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filtered.length} entries
            </span>
          </div>

          {/* Category Filters */}
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
                {CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 space-y-3">
              <Award className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-extrabold text-foreground">No certificates found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No items match your search. Click the Add Certificate button above to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-sm md:text-base leading-tight text-foreground">
                          {cert.title}
                        </h3>
                        <p className="text-xs text-primary font-bold mt-1">
                          {cert.issuer}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground text-[9px] font-black uppercase tracking-wider">
                        {getCategoryLabel(cert.category)}
                      </span>
                    </div>

                    {cert.image_url && (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950/40 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center max-w-[160px] mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={getDirectImageUrl(cert.image_url)} 
                          alt={cert.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground font-semibold pt-0.5 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                      </span>
                      {cert.credential_id && (
                        <span className="flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-primary" />
                          <span>ID: {cert.credential_id}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/5 dark:border-slate-800/5 mt-4">
                    <div>
                      {cert.image_url && (
                        <a
                          href={cert.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cert)}
                        className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(cert.id)}
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
