'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { saveProjectAction, deleteProjectAction, updateProjectsOrderAction, updateFeaturedProjectsOrderAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'
import { Project, ProjectsCrudProps, DEFAULT_PROJECT, DATA_SUBCATEGORIES, NON_DATA_SUBCATEGORIES } from './types'
import { useProjectFilters } from './useProjectFilters'
import { usePagination } from './usePagination'
import { ProjectControls } from './ProjectControls'
import { ProjectGridView } from './ProjectGridView'
import { ProjectTableView } from './ProjectTableView'
import { ProjectForm } from './ProjectForm'
import { ProjectPreviewModal } from './ProjectPreviewModal'
import { OrderModal } from './OrderModal'
import { PaginationControls } from './PaginationControls'

export function ProjectsCrud({ initialProjects }: ProjectsCrudProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects)
  const [prevInitialProjects, setPrevInitialProjects] = React.useState(initialProjects)

  if (initialProjects !== prevInitialProjects) {
    setPrevInitialProjects(initialProjects)
    setProjects(initialProjects)
  }

  const [activeCategory, setActiveCategory] = React.useState<'data' | 'non-data'>('data')
  const [search, setSearch] = React.useState('')
  const [activeSubCategory, setActiveSubCategory] = React.useState<string>('All')
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid')
  const [sortField, setSortField] = React.useState<'pinned' | 'featured' | 'newest' | 'oldest' | 'title'>('pinned')
  const [pageSize, setPageSize] = React.useState(12)
  const [editingProject, setEditingProject] = React.useState<Partial<Project> | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)
  const [previewProject, setPreviewProject] = React.useState<Project | null>(null)

  // Order modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false)
  const [orderModalList, setOrderModalList] = React.useState<Project[]>([])
  const [isFeaturedOrderModalOpen, setIsFeaturedOrderModalOpen] = React.useState(false)
  const [featuredOrderList, setFeaturedOrderList] = React.useState<Project[]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('project_admin_active_category')
    if (stored === 'data' || stored === 'non-data') {
      setTimeout(() => setActiveCategory(stored), 0)
    }
  }, [])

  React.useEffect(() => {
    setTimeout(() => {
      setActiveSubCategory('All')
      setSearch('')
    }, 0)
  }, [activeCategory])

  // Auto-assign pinned orders on mount
  React.useEffect(() => {
    if (!mounted) return

    const needsPinning = projects.some(p => p.pinned_order === null || p.pinned_order === undefined || p.pinned_order === 0)
    if (!needsPinning) return

    const categories: ('data' | 'non-data')[] = ['data', 'non-data']
    const allUpdates: { id: string; pinned_order: number }[] = []
    let updatedProjectsList = [...projects]
    let hasChanges = false

    categories.forEach(cat => {
      const catProjects = updatedProjectsList.filter(p => p.category === cat)
      if (catProjects.length === 0) return

      const pinned = catProjects.filter(p => p.pinned_order !== null && p.pinned_order !== undefined && p.pinned_order > 0)
      pinned.sort((a, b) => (a.pinned_order || 0) - (b.pinned_order || 0))

      const unpinned = catProjects.filter(p => p.pinned_order === null || p.pinned_order === undefined || p.pinned_order === 0)
      unpinned.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return bTime - aTime
      })

      const combined = [...pinned, ...unpinned]
      combined.forEach((proj, idx) => {
        const expectedOrder = idx + 1
        if (proj.pinned_order !== expectedOrder) {
          allUpdates.push({ id: proj.id, pinned_order: expectedOrder })
          hasChanges = true
          
          updatedProjectsList = updatedProjectsList.map(p => 
            p.id === proj.id ? { ...p, pinned_order: expectedOrder } : p
          )
        }
      })
    })

    if (hasChanges) {
      setTimeout(() => {
        setProjects(updatedProjectsList)
        updateProjectsOrderAction(allUpdates).catch(err => {
          console.error('Error auto-pinning projects on mount:', err)
        })
      }, 0)
    }
  }, [projects, mounted])

  // Initialize order modal list
  React.useEffect(() => {
    if (isOrderModalOpen && editingProject) {
      const categoryProjects = [...projects.filter(p => p.category === editingProject.category)]
      
      const pinned = categoryProjects.filter(p => p.pinned_order !== null && p.pinned_order !== undefined && p.pinned_order > 0)
      pinned.sort((a, b) => (a.pinned_order || 0) - (b.pinned_order || 0))
      
      const unpinned = categoryProjects.filter(p => p.pinned_order === null || p.pinned_order === undefined || p.pinned_order === 0)
      unpinned.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return bTime - aTime
      })
      
      let combined = [...pinned, ...unpinned]
      
      const isEditingInList = combined.some(p => p.id === editingProject.id)
      if (!isEditingInList) {
        const currentProjTemp: Project = {
          id: editingProject.id || 'temp-current-id',
          title: editingProject.title || 'Untitled Project (Current)',
          description: editingProject.description || '',
          content: editingProject.content || null,
          category: editingProject.category || 'data',
          sub_category: editingProject.sub_category || '',
          cover_image: editingProject.cover_image || null,
          github_url: editingProject.github_url || null,
          demo_url: editingProject.demo_url || null,
          notebook_url: editingProject.notebook_url || null,
          embed_code: editingProject.embed_code || null,
          is_featured: editingProject.is_featured || false,
          is_on_progress: editingProject.is_on_progress || false,
          pinned_order: editingProject.pinned_order || 0,
          featured_order: editingProject.featured_order || 0,
          created_at: editingProject.created_at || new Date().toISOString()
        }
        combined.push(currentProjTemp)
      } else {
        combined = combined.map(p => p.id === editingProject.id ? { ...p, title: editingProject.title || p.title } : p)
      }
      
      const listWithOrders = combined.map((p, idx) => ({
        ...p,
        pinned_order: idx + 1
      }))
      
      setTimeout(() => setOrderModalList(listWithOrders), 0)
    }
  }, [isOrderModalOpen, editingProject, projects])

  // Initialize featured order modal list
  React.useEffect(() => {
    if (isFeaturedOrderModalOpen && editingProject) {
      const featured = projects.filter(p => p.is_featured)
      featured.sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
      
      const isEditingFeatured = featured.some(p => p.id === editingProject.id)
      let initialList = [...featured]
      
      if (!isEditingFeatured && editingProject.is_featured) {
        const currentProjTemp: Project = {
          id: editingProject.id || 'temp-current-id',
          title: editingProject.title || 'Untitled Project (Current)',
          description: editingProject.description || '',
          content: editingProject.content || null,
          category: editingProject.category || 'data',
          sub_category: editingProject.sub_category || '',
          cover_image: editingProject.cover_image || null,
          github_url: editingProject.github_url || null,
          demo_url: editingProject.demo_url || null,
          notebook_url: editingProject.notebook_url || null,
          embed_code: editingProject.embed_code || null,
          is_featured: true,
          is_on_progress: editingProject.is_on_progress || false,
          pinned_order: editingProject.pinned_order || 0,
          featured_order: editingProject.featured_order || 0,
          created_at: editingProject.created_at || new Date().toISOString()
        }
        initialList.push(currentProjTemp)
      } else {
        initialList = initialList.map(p => p.id === editingProject.id ? { ...p, title: editingProject.title || p.title } : p)
      }
      
      setTimeout(() => setFeaturedOrderList(initialList), 0)
    }
  }, [isFeaturedOrderModalOpen, editingProject, projects])

  React.useEffect(() => {
    if (isOrderModalOpen || isFeaturedOrderModalOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [isOrderModalOpen, isFeaturedOrderModalOpen])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('project_admin_notification')
    if (stored) {
      try {
        setTimeout(() => setNotification(JSON.parse(stored)), 0)
      } catch (e) {
        console.error(e)
      }
      sessionStorage.removeItem('project_admin_notification')
    }
  }, [])

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const availableFilters = React.useMemo(() => {
    const categoryProjects = projects.filter(p => p.category === activeCategory)
    const uniqueInDb = Array.from(new Set(categoryProjects.map(p => 
      p.sub_category === 'Data Automation Projects' ? 'Automation Projects' : p.sub_category
    ))).filter(Boolean)
    const baseSubcategories = activeCategory === 'data' ? DATA_SUBCATEGORIES : NON_DATA_SUBCATEGORIES
    const combined = ['All', ...baseSubcategories]
    uniqueInDb.forEach(sub => {
      if (!combined.includes(sub)) {
        combined.push(sub)
      }
    })
    return combined
  }, [projects, activeCategory])

  const filteredAndSorted = useProjectFilters(projects, activeCategory, search, activeSubCategory, sortField)
  const { currentPage, setCurrentPage, totalPages, startIndex } = usePagination(filteredAndSorted.length, pageSize)
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize)

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDuplicate = (project: Project) => {
    const categoryProjects = projects.filter(p => p.category === project.category)
    const maxPin = categoryProjects.reduce((max, p) => Math.max(max, p.pinned_order || 0), 0)

    setEditingProject({
      ...project,
      id: undefined,
      title: `${project.title} (Copy)`,
      pinned_order: maxPin + 1
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    const categoryProjects = projects.filter(p => p.category === activeCategory)
    const maxPin = categoryProjects.reduce((max, p) => Math.max(max, p.pinned_order || 0), 0)

    setEditingProject({ 
      ...DEFAULT_PROJECT,
      category: activeCategory,
      sub_category: activeCategory === 'data' ? 'Data Analytics Projects' : 'Web Development Projects',
      pinned_order: maxPin + 1
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setIsPending(true)
      try {
        const res = await deleteProjectAction(id)
        if (res.success) {
          setProjects(prev => prev.filter(p => p.id !== id))
          setNotification({ success: true, message: 'Project deleted successfully.' })
        } else {
          setNotification({ success: false, message: 'Failed to delete project.' })
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
    if (!editingProject?.title || !editingProject?.description) {
      alert('Title and Description are required!')
      return
    }

    if (editingProject.is_featured) {
      const featuredCount = projects.filter(p => p.is_featured && p.id !== editingProject.id).length
      if (featuredCount >= 9) {
        alert('You can only feature a maximum of 9 projects on the home page. Please unmark another project as featured first.')
        return
      }
    }

    if (editingProject.pinned_order && editingProject.pinned_order > 0) {
      const isDuplicate = projects.some(p => 
        p.id !== editingProject.id && 
        p.category === editingProject.category && 
        p.pinned_order === editingProject.pinned_order
      )
      if (isDuplicate) {
        alert(`Pinned Order Index ${editingProject.pinned_order} is already occupied by another project in the ${editingProject.category === 'data' ? 'Data Science' : 'General Dev'} category. Please use a different index.`)
        return
      }
    }

    setIsPending(true)
    setNotification(null)

    try {
      const res = await saveProjectAction(editingProject)
      if (res.success) {
        if (editingProject.id) {
          setProjects(prev => prev.map(p => p.id === editingProject.id ? ((res.message || '').includes('Mock') ? { ...p, ...editingProject } as Project : editingProject as Project) : p))
        } else {
          sessionStorage.setItem('project_admin_notification', JSON.stringify({ success: true, message: res.message || 'Saved successfully.' }))
          window.location.reload()
          return
        }
        setEditingProject(null)
        setNotification({ success: true, message: res.message || 'Saved successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to save project.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error saving project.' })
    } finally {
      setIsPending(false)
    }
  }

  const handleSaveOrder = async () => {
    setIsPending(true)
    try {
      const updatesToDb: { id: string; pinned_order: number }[] = []
      let newEditingProjectPinnedOrder = 0

      orderModalList.forEach((proj, idx) => {
        const newIdx = idx + 1
        
        if (proj.id === (editingProject?.id || 'temp-current-id')) {
          newEditingProjectPinnedOrder = newIdx
        }
        
        if (proj.id && proj.id !== 'temp-current-id') {
          updatesToDb.push({ id: proj.id, pinned_order: newIdx })
        }
      })

      if (updatesToDb.length > 0) {
        const res = await updateProjectsOrderAction(updatesToDb)
        if (!res.success) {
          throw new Error(res.error || 'Failed to update orders of other projects')
        }
      }

      setProjects(prev => prev.map(p => {
        const update = updatesToDb.find(u => u.id === p.id)
        if (update) {
          return { ...p, pinned_order: update.pinned_order }
        }
        return p
      }))

      setEditingProject(prev => prev ? { ...prev, pinned_order: newEditingProjectPinnedOrder } : null)
      setNotification({ success: true, message: 'Projects reordered successfully.' })
      setIsOrderModalOpen(false)
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: err instanceof Error ? err.message : 'Error reordering projects.' })
    } finally {
      setIsPending(false)
    }
  }

  const handleSaveFeaturedOrder = async () => {
    setIsPending(true)
    try {
      const updatesToDb: { id: string; featured_order: number; is_featured?: boolean }[] = []
      let newEditingProjectFeaturedOrder = editingProject?.featured_order || 0
      let newEditingProjectIsFeatured = !!editingProject?.is_featured

      const originalFeatured = projects.filter(p => p.is_featured)
      const removedProjects = originalFeatured.filter(op => 
        op.id !== editingProject?.id && 
        !featuredOrderList.some(f => f.id === op.id)
      )

      featuredOrderList.forEach((proj, idx) => {
        const newIdx = idx + 1
        
        if (proj.id === (editingProject?.id || 'temp-current-id')) {
          newEditingProjectFeaturedOrder = newIdx
          newEditingProjectIsFeatured = true
        }
        
        if (proj.id && proj.id !== 'temp-current-id') {
          updatesToDb.push({ id: proj.id, featured_order: newIdx, is_featured: true })
        }
      })

      removedProjects.forEach(proj => {
        updatesToDb.push({ id: proj.id, featured_order: 0, is_featured: false })
      })

      if (updatesToDb.length > 0) {
        const res = await updateFeaturedProjectsOrderAction(updatesToDb)
        if (!res.success) {
          throw new Error(res.error || 'Failed to update featured projects order')
        }
      }

      setProjects(prev => prev.map(p => {
        const update = updatesToDb.find(u => u.id === p.id)
        if (update) {
          return { 
            ...p, 
            featured_order: update.featured_order,
            is_featured: update.is_featured !== undefined ? update.is_featured : p.is_featured 
          }
        }
        return p
      }))

      const isCurrentInList = featuredOrderList.some(proj => proj.id === (editingProject?.id || 'temp-current-id'))
      if (!isCurrentInList) {
        newEditingProjectFeaturedOrder = 0
        newEditingProjectIsFeatured = false
      }

      setEditingProject(prev => prev ? { 
        ...prev, 
        featured_order: newEditingProjectFeaturedOrder, 
        is_featured: newEditingProjectIsFeatured 
      } : null)

      setNotification({ success: true, message: 'Featured projects reordered successfully.' })
      setIsFeaturedOrderModalOpen(false)
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: err instanceof Error ? err.message : 'Error reordering featured projects.' })
    } finally {
      setIsPending(false)
    }
  }

  const unfeatureProject = (id: string) => {
    setFeaturedOrderList(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Glass Card Container */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Projects Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Publish and manage data science case studies, analytics dashboards, and web applications.
          </p>
        </div>

        {!editingProject && (
          <button
            onClick={handleCreateNew}
            className="group py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 shrink-0 self-start sm:self-center z-10"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Project</span>
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
      {editingProject && (
        <ProjectForm
          project={editingProject}
          projects={projects}
          onCancel={() => setEditingProject(null)}
          onSave={handleSave}
          onUpdateProject={setEditingProject}
          onOpenOrderModal={() => setIsOrderModalOpen(true)}
          onOpenFeaturedOrderModal={() => setIsFeaturedOrderModalOpen(true)}
          isPending={isPending}
          setNotification={setNotification}
        />
      )}

      {/* Main Listing Controls & Views */}
      {!editingProject && (
        <div className="space-y-4">
          <ProjectControls
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              setActiveCategory(cat)
              setCurrentPage(1)
            }}
            search={search}
            onSearchChange={(val) => {
              setSearch(val)
              setCurrentPage(1)
            }}
            activeSubCategory={activeSubCategory}
            onSubCategoryChange={(val) => {
              setActiveSubCategory(val)
              setCurrentPage(1)
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortField={sortField}
            onSortFieldChange={(val) => {
              setSortField(val)
              setCurrentPage(1)
            }}
            availableFilters={availableFilters}
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
                  <Coffee className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <h3 className="font-extrabold text-foreground text-base">No projects found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    No items match your search &quot;{search}&quot;. Click Add Project button to publish new projects.
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                <ProjectTableView
                  projects={paginatedItems}
                  startIndex={startIndex}
                  onPreview={setPreviewProject}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ) : (
                <ProjectGridView
                  projects={paginatedItems}
                  onPreview={setPreviewProject}
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

      {/* Order Modals */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          orderList={orderModalList}
          onReorder={setOrderModalList}
          onSave={handleSaveOrder}
          isPending={isPending}
          title="Manage Pinned Orders"
          description={`Category: ${editingProject?.category === 'data' ? 'Data Science' : 'General Dev'}`}
          currentProjectId={editingProject?.id || 'temp-current-id'}
        />,
        document.body
      )}

      {mounted && typeof document !== 'undefined' && createPortal(
        <OrderModal
          isOpen={isFeaturedOrderModalOpen}
          onClose={() => setIsFeaturedOrderModalOpen(false)}
          orderList={featuredOrderList}
          onReorder={setFeaturedOrderList}
          onSave={handleSaveFeaturedOrder}
          isPending={isPending}
          title="Manage Featured Orders"
          description="Sort which projects show up first on the home page (Max 9 shown)"
          currentProjectId={editingProject?.id || 'temp-current-id'}
          showUnfeatureButton
          onUnfeature={unfeatureProject}
        />,
        document.body
      )}

      {/* Preview Modal */}
      <ProjectPreviewModal
        project={previewProject}
        onClose={() => setPreviewProject(null)}
        onEdit={handleEdit}
      />
    </div>
  )
}
