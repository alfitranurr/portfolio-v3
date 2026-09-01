'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { saveExperienceAction, deleteExperienceAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'
import { Experience, ExperienceCrudProps, DEFAULT_EXPERIENCE, SortField, ViewMode } from './types'
import { useExperienceFilters } from './useExperienceFilters'
import { usePagination } from './usePagination'
import { ExperienceControls } from './ExperienceControls'
import { ExperienceGridView } from './ExperienceGridView'
import { ExperienceTableView } from './ExperienceTableView'
import { ExperienceForm } from './ExperienceForm'
import { ExperiencePreviewModal } from './ExperiencePreviewModal'
import { PaginationControls } from './PaginationControls'

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
  const [pageSize, setPageSize] = React.useState(10)
  const [editingItem, setEditingItem] = React.useState<Partial<Experience> | null>(null)
  const [descriptionBullets, setDescriptionBullets] = React.useState<string[]>([])
  const [isPending, setIsPending] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)
  const [previewItem, setPreviewItem] = React.useState<Experience | null>(null)

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

  const filteredAndSorted = useExperienceFilters(experienceList, search, activeCategory, sortField)
  const { currentPage, setCurrentPage, totalPages, startIndex } = usePagination(filteredAndSorted.length, pageSize)
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

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
        setDescriptionBullets([])
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
      <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Work Experience
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Manage professional experience, committee roles, and organizational involvement.
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
      {editingItem && (
        <ExperienceForm
          experience={editingItem}
          descriptionBullets={descriptionBullets}
          onCancel={() => {
            setEditingItem(null)
            setDescriptionBullets([])
          }}
          onSave={handleSave}
          onUpdateExperience={setEditingItem}
          onAddBullet={handleAddBullet}
          onRemoveBullet={handleRemoveBullet}
          onBulletChange={handleBulletChange}
          onMoveBullet={handleMoveBullet}
          isPending={isPending}
          setNotification={setNotification}
        />
      )}

      {/* Main Listing Controls & Views */}
      {!editingItem && (
        <div className="space-y-4">
          <ExperienceControls
            search={search}
            onSearchChange={(val) => {
              setSearch(val)
              setCurrentPage(1)
            }}
            activeCategory={activeCategory}
            onCategoryChange={(val) => {
              setActiveCategory(val)
              setCurrentPage(1)
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortField={sortField}
            onSortFieldChange={(val) => {
              setSortField(val)
              setCurrentPage(1)
            }}
            totalItems={filteredAndSorted.length}
            displayedItems={paginatedItems.length}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full"
            >
              {filteredAndSorted.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
                  <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <h3 className="font-extrabold text-foreground text-base">No experience found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    No items match your search &quot;{search}&quot;. Click Add Experience button to add new entries.
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                <ExperienceTableView
                  experiences={paginatedItems}
                  startIndex={startIndex}
                  onPreview={setPreviewItem}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ) : (
                <ExperienceGridView
                  experiences={paginatedItems}
                  onPreview={setPreviewItem}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSorted.length}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Preview Modal */}
      <ExperiencePreviewModal
        experience={previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={handleEdit}
      />
    </div>
  )
}
