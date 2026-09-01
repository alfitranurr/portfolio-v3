'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { saveSkillAction, deleteSkillAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'
import { Skill, SkillsCrudProps, DEFAULT_SKILL, SortField, ViewMode } from './types'
import { useSkillsFilters } from './useSkillsFilters'
import { usePagination } from './usePagination'
import { SkillsControls } from './SkillsControls'
import { SkillGridView } from './SkillGridView'
import { SkillTableView } from './SkillTableView'
import { SkillForm } from './SkillForm'
import { SkillPreviewModal } from './SkillPreviewModal'
import { PaginationControls } from './PaginationControls'

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
  const [sortField, setSortField] = React.useState<SortField>('newest')
  const [pageSize, setPageSize] = React.useState(10)
  const [editingItem, setEditingItem] = React.useState<Partial<Skill> | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)
  const [previewItem, setPreviewItem] = React.useState<Skill | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const stored = sessionStorage.getItem('skill_admin_notification')
      if (stored) {
        try {
          setNotification(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
        sessionStorage.removeItem('skill_admin_notification')
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

  const filteredAndSorted = useSkillsFilters(skills, search, activeCategory, sortField)
  const { currentPage, setCurrentPage, totalPages, startIndex } = usePagination(filteredAndSorted.length, pageSize)
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

  const handleEdit = (item: Skill) => {
    setEditingItem(item)
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
    if (confirm('Are you sure you want to delete this skill?')) {
      setIsPending(true)
      try {
        const res = await deleteSkillAction(id)
        if (res.success) {
          setSkills(prev => prev.filter(s => s.id !== id))
          setNotification({ success: true, message: 'Skill deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete skill.' })
        }
      } catch (err) {
        console.error(err)
        setNotification({ success: false, message: 'Error deleting skill.' })
      } finally {
        setIsPending(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem?.name) {
      alert('Skill Name is required!')
      return
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await saveSkillAction(editingItem)
      if (res.success) {
        if (editingItem.id) {
          setSkills(prev => prev.map(item => item.id === editingItem.id ? ((res.message || '').includes('Mock') ? { ...item, ...editingItem } as Skill : editingItem as Skill) : item))
        } else {
          sessionStorage.setItem('skill_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingItem(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save skill.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving skill.' })
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
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Skills
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Manage technical skills, soft skills, and tools.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="group py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 shrink-0 self-start sm:self-center z-10"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Skill</span>
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
        <SkillForm
          skill={editingItem}
          onCancel={() => setEditingItem(null)}
          onSave={handleSave}
          onUpdateSkill={setEditingItem}
          isPending={isPending}
        />
      )}

      {/* Main Listing Controls & Views */}
      {!editingItem && (
        <div className="space-y-4">
          <SkillsControls
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
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full"
            >
              {filteredAndSorted.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
                  <Award className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <h3 className="font-extrabold text-foreground text-base">No skills found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    No items match your search &quot;{search}&quot;. Click Add Skill button to add new entries.
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                <SkillTableView
                  skills={paginatedItems}
                  startIndex={startIndex}
                  onPreview={setPreviewItem}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ) : (
                <SkillGridView
                  skills={paginatedItems}
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
      {mounted && (
        <SkillPreviewModal
          skill={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}
