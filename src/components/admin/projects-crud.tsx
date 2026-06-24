'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coffee, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ExternalLink, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Layers,
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  Presentation,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { saveProjectAction, deleteProjectAction, uploadAssetAction, updateProjectsOrderAction } from '@/app/admin/actions'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { Github } from '@/components/icons'
import { BlurImage } from '@/components/ui/blur-image'

interface Project {
  id: string
  title: string
  description: string
  content: string | null
  category: 'data' | 'non-data'
  sub_category: string
  cover_image: string | null
  github_url: string | null
  demo_url: string | null
  notebook_url: string | null
  slide_url?: string | null
  embed_code: string | null
  is_featured: boolean | null
  pinned_order: number | null
  created_at?: string
  updated_at?: string
}

interface ProjectsCrudProps {
  initialProjects: Project[]
}

const DATA_SUBCATEGORIES = [
  'Data Analytics Projects',
  'Data Visualization Projects',
  'Artificial Intelligence Projects',
  'Automation Projects',
  'Data Modeling and Simulation Projects',
]

const NON_DATA_SUBCATEGORIES = [
  'Web Development Projects',
  'Mobile Development Projects',
  'Digital Marketing Projects',
  'Graphic Design Projects',
]

const SUBCATEGORY_MAP: Record<string, string> = {
  'All': 'All Subcategories',
  'Data Analytics Projects': 'Data Analytics',
  'Data Visualization Projects': 'Data Visualization',
  'Artificial Intelligence Projects': 'Artificial Intelligence',
  'Data Automation Projects': 'Automation',
  'Automation Projects': 'Automation',
  'Data Modeling and Simulation Projects': 'Data Modeling & Simulation',
  'Web Development Projects': 'Web Development',
  'Mobile Development Projects': 'Mobile Development',
  'Digital Marketing Projects': 'Digital Marketing',
  'Graphic Design Projects': 'Graphic Design',
}

const DEFAULT_PROJECT: Omit<Project, 'id'> = {
  title: '',
  description: '',
  content: '',
  category: 'data',
  sub_category: 'Data Analytics Projects',
  cover_image: '',
  github_url: '',
  demo_url: '',
  notebook_url: '',
  slide_url: '',
  embed_code: '',
  is_featured: false,
  pinned_order: 0,
  created_at: new Date().toLocaleDateString('en-CA')
}

export function ProjectsCrud({ initialProjects }: ProjectsCrudProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects)
  const [activeCategory, setActiveCategory] = React.useState<'data' | 'non-data'>('data')
  const [search, setSearch] = React.useState('')
  const [activeSubCategory, setActiveSubCategory] = React.useState<string>('All')

  React.useEffect(() => {
    const stored = sessionStorage.getItem('project_admin_active_category')
    if (stored === 'data' || stored === 'non-data') {
      setTimeout(() => {
        setActiveCategory(stored)
      }, 0)
    }
  }, [])

  React.useEffect(() => {
    setTimeout(() => {
      setActiveSubCategory('All')
      setSearch('')
    }, 0)
  }, [activeCategory])
  const [editingProject, setEditingProject] = React.useState<Partial<Project> | null>(null)
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setTimeout(() => {
      setMounted(true)
    }, 0)
  }, [])

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

      // Sort currently pinned projects
      const pinned = catProjects.filter(p => p.pinned_order !== null && p.pinned_order !== undefined && p.pinned_order > 0)
      pinned.sort((a, b) => (a.pinned_order || 0) - (b.pinned_order || 0))

      // Sort unpinned projects by date desc
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

  const [isPending, setIsPending] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ success: boolean; message: string } | null>(null)

  // Order popup state and methods
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false)
  const [orderModalList, setOrderModalList] = React.useState<Project[]>([])

  React.useEffect(() => {
    if (isOrderModalOpen && editingProject) {
      const categoryProjects = [...projects.filter(p => p.category === editingProject.category)]
      
      // Separate currently pinned projects and sort them
      const pinned = categoryProjects.filter(p => p.pinned_order !== null && p.pinned_order !== undefined && p.pinned_order > 0)
      pinned.sort((a, b) => (a.pinned_order || 0) - (b.pinned_order || 0))
      
      // Separate currently unpinned projects and sort by date desc
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
          pinned_order: editingProject.pinned_order || 0,
          created_at: editingProject.created_at || new Date().toISOString()
        }
        combined.push(currentProjTemp)
      } else {
        combined = combined.map(p => p.id === editingProject.id ? { ...p, title: editingProject.title || p.title } : p)
      }
      
      // Auto-assign order index sequentially (pin all projects automatically)
      const listWithOrders = combined.map((p, idx) => ({
        ...p,
        pinned_order: idx + 1
      }))
      
      setTimeout(() => {
        setOrderModalList(listWithOrders)
      }, 0)
    }
  }, [isOrderModalOpen, editingProject, projects])

  // Featured order modal state and methods
  const [isFeaturedOrderModalOpen, setIsFeaturedOrderModalOpen] = React.useState(false)
  const [featuredOrderList, setFeaturedOrderList] = React.useState<Project[]>([])

  React.useEffect(() => {
    if (isFeaturedOrderModalOpen && editingProject) {
      const featured = projects.filter(p => p.is_featured)
      featured.sort((a, b) => (a.pinned_order || 0) - (b.pinned_order || 0))
      
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
          pinned_order: editingProject.pinned_order || 0,
          created_at: editingProject.created_at || new Date().toISOString()
        }
        initialList.push(currentProjTemp)
      } else {
        initialList = initialList.map(p => p.id === editingProject.id ? { ...p, title: editingProject.title || p.title } : p)
      }
      
      setTimeout(() => {
        setFeaturedOrderList(initialList)
      }, 0)
    }
  }, [isFeaturedOrderModalOpen, editingProject, projects])

  React.useEffect(() => {
    if (isOrderModalOpen || isFeaturedOrderModalOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOrderModalOpen, isFeaturedOrderModalOpen])

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...orderModalList]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newList.length) return
    
    // Swap items
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp
    
    setOrderModalList(newList)
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

  const moveFeaturedItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...featuredOrderList]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newList.length) return
    
    // Swap items
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp
    
    setFeaturedOrderList(newList)
  }

  const unfeatureProject = (id: string) => {
    setFeaturedOrderList(prev => prev.filter(p => p.id !== id))
  }

  const handleSaveFeaturedOrder = async () => {
    setIsPending(true)
    try {
      const updatesToDb: { id: string; pinned_order: number; is_featured?: boolean }[] = []
      let newEditingProjectPinnedOrder = editingProject?.pinned_order || 0
      let newEditingProjectIsFeatured = !!editingProject?.is_featured

      // Identify removed featured projects
      const originalFeatured = projects.filter(p => p.is_featured)
      const removedProjects = originalFeatured.filter(op => 
        op.id !== editingProject?.id && 
        !featuredOrderList.some(f => f.id === op.id)
      )

      featuredOrderList.forEach((proj, idx) => {
        const newIdx = idx + 1
        
        if (proj.id === (editingProject?.id || 'temp-current-id')) {
          newEditingProjectPinnedOrder = newIdx
          newEditingProjectIsFeatured = true
        }
        
        if (proj.id && proj.id !== 'temp-current-id') {
          updatesToDb.push({ id: proj.id, pinned_order: newIdx, is_featured: true })
        }
      })

      removedProjects.forEach(proj => {
        updatesToDb.push({ id: proj.id, pinned_order: 0, is_featured: false })
      })

      if (updatesToDb.length > 0) {
        const res = await updateProjectsOrderAction(updatesToDb)
        if (!res.success) {
          throw new Error(res.error || 'Failed to update featured projects order')
        }
      }

      setProjects(prev => prev.map(p => {
        const update = updatesToDb.find(u => u.id === p.id)
        if (update) {
          return { 
            ...p, 
            pinned_order: update.pinned_order,
            is_featured: update.is_featured !== undefined ? update.is_featured : p.is_featured 
          }
        }
        return p
      }))

      const isCurrentInList = featuredOrderList.some(proj => proj.id === (editingProject?.id || 'temp-current-id'))
      if (!isCurrentInList) {
        newEditingProjectPinnedOrder = 0
        newEditingProjectIsFeatured = false
      }

      setEditingProject(prev => prev ? { 
        ...prev, 
        pinned_order: newEditingProjectPinnedOrder, 
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

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setNotification(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'project-cover')
      const res = await uploadAssetAction(formData)
      if (res.success && res.url) {
        setEditingProject(prev => prev ? ({ ...prev, cover_image: res.url }) : null)
        setNotification({ success: true, message: 'Cover image uploaded successfully.' })
      } else {
        setNotification({ success: false, message: res.error || 'Failed to upload cover image.' })
      }
    } catch (err) {
      console.error(err)
      setNotification({ success: false, message: 'Error uploading cover image.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveCoverImage = () => {
    setEditingProject(prev => prev ? ({ ...prev, cover_image: null }) : null)
  }

  // Compute subcategory options dynamically for filtering listing
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

  // Subcategory options for dropdown in edit form
  const currentCategory = editingProject?.category || 'data'
  const subCategoryOptions = React.useMemo(() => {
    return currentCategory === 'data' ? DATA_SUBCATEGORIES : NON_DATA_SUBCATEGORIES
  }, [currentCategory])

  const finalOptions = React.useMemo(() => {
    if (editingProject?.sub_category && !subCategoryOptions.includes(editingProject.sub_category)) {
      return [editingProject.sub_category, ...subCategoryOptions]
    }
    return subCategoryOptions
  }, [editingProject, subCategoryOptions])

  React.useEffect(() => {
    setTimeout(() => {
      setProjects(initialProjects)
    }, 0)
  }, [initialProjects])

  React.useEffect(() => {
    const stored = sessionStorage.getItem('project_admin_notification')
    if (stored) {
      try {
        setTimeout(() => {
          setNotification(JSON.parse(stored))
        }, 0)
      } catch (e) {
        console.error(e)
      }
      sessionStorage.removeItem('project_admin_notification')
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

  // Filter
  const filtered = projects.filter(p => {
    const matchesCategory = p.category === activeCategory
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sub_category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    
    // Normalize subcategory match for backward compatibility
    const normalizedProjSub = p.sub_category === 'Data Automation Projects' ? 'Automation Projects' : p.sub_category
    const normalizedActiveSub = activeSubCategory === 'Data Automation Projects' ? 'Automation Projects' : activeSubCategory

    const matchesSubCategory = normalizedActiveSub === 'All' || normalizedProjSub === normalizedActiveSub
    return matchesCategory && matchesSearch && matchesSubCategory
  })

  const handleEdit = (project: Project) => {
    setEditingProject(project)
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

    // Check limit of featured projects (max 3 globally)
    if (editingProject.is_featured) {
      const featuredCount = projects.filter(p => p.is_featured && p.id !== editingProject.id).length
      if (featuredCount >= 3) {
        alert('You can only feature a maximum of 3 projects on the home page. Please unmark another project as featured first.')
        return
      }
    }

    // Check for duplicate pinned order index within the category
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
        // Refresh local array
        if (editingProject.id) {
          setProjects(prev => prev.map(p => p.id === editingProject.id ? ((res.message || '').includes('Mock') ? { ...p, ...editingProject } as Project : editingProject as Project) : p))
        } else {
          // If insert, re-query page or push
          // Since it's mockup or db, we update list locally. In db mode, page reload validates
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Projects Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish and manage data science case studies and web applications.
          </p>
        </div>
        {!editingProject && (
          <button
            onClick={handleCreateNew}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
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
        <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
            <button
              onClick={() => setEditingProject(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Listing</span>
            </button>
            <h2 className="text-sm font-black uppercase tracking-wider text-primary">
              {editingProject.id ? 'Edit Project Details' : 'Create New Project'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Project Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. XGBoost Predictive customer model"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Short Description <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingProject.description || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Summarize the core impact or solution of the project in 2-3 sentences."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Grid Category & Sub */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Category Type
                    </label>
                    <select
                      value={editingProject.category || 'data'}
                      onChange={e => {
                        const newCat = e.target.value as 'data' | 'non-data'
                        const defaultSub = newCat === 'data' ? 'Data Analytics Projects' : 'Web Development Projects'
                        
                        // Calculate next pinned order for the new category
                        const categoryProjects = projects.filter(p => p.category === newCat)
                        const maxPin = categoryProjects.reduce((max, p) => Math.max(max, p.pinned_order || 0), 0)

                        setEditingProject(prev => ({
                          ...prev,
                          category: newCat,
                          sub_category: defaultSub,
                          pinned_order: maxPin + 1
                        }))
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="data" className="bg-white dark:bg-slate-950 text-foreground">Data Science</option>
                      <option value="non-data" className="bg-white dark:bg-slate-950 text-foreground">General Dev</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Sub Category Tag
                    </label>
                    <select
                      value={editingProject.sub_category || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, sub_category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                    >
                      {finalOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-white dark:bg-slate-950 text-foreground">
                          {SUBCATEGORY_MAP[opt] || opt.replace(' Projects', '')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.github_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, github_url: e.target.value }))}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.demo_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, demo_url: e.target.value }))}
                      placeholder="https://my-demo.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Jupyter Notebook URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.notebook_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, notebook_url: e.target.value }))}
                      placeholder="https://colab.research.google.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Reporting Presentation
                    </label>
                    <input
                      type="url"
                      value={editingProject.slide_url || ''}
                      onChange={e => setEditingProject(prev => ({ ...prev, slide_url: e.target.value }))}
                      placeholder="https://canva.com/design/... or Google Slides link"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Cover Image Upload Container (Full Width) */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Cover Image
                  </label>
                  
                  <div className="flex items-center gap-4">
                    {/* Preview box */}
                    <div className="relative group w-14 h-14 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 bg-slate-200/5 flex items-center justify-center shrink-0">
                      {editingProject.cover_image ? (
                        <>
                          <BlurImage
                            src={getDirectImageUrl(editingProject.cover_image, 200)}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveCoverImage}
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
                            <span>{editingProject.cover_image ? 'Change Cover' : 'Upload Cover'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      
                      <input
                        type="text"
                        value={editingProject.cover_image || ''}
                        onChange={e => setEditingProject(prev => ({ ...prev, cover_image: e.target.value }))}
                        placeholder="Or paste Cover Image URL"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-[11px] focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Code & Markdown */}
              <div className="space-y-4">
                {/* Write-up Markdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Detailed Case Study (Markdown Supported)
                  </label>
                  <textarea
                    rows={8}
                    value={editingProject.content || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="## Executive Summary&#10;Write detailed methodologies, Python code samples, and model evaluation results here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Priority and Toggle flags */}
                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFeaturedOrderModalOpen(true)}
                      className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all flex items-center justify-center border border-primary/20 cursor-pointer shrink-0"
                      title="Manage Featured Orders"
                      aria-label="Manage Featured Orders"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={!!editingProject.is_featured}
                        onChange={e => {
                          const val = e.target.checked
                          if (val) {
                            const featuredCount = projects.filter(p => p.is_featured && p.id !== editingProject.id).length
                            if (featuredCount >= 3) {
                              alert('You can only feature a maximum of 3 projects on the home page. Please unmark another project as featured first.')
                              return
                            }
                          }
                          setEditingProject(prev => prev ? ({ ...prev, is_featured: val }) : null)
                        }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-200/20 dark:border-slate-800/15 cursor-pointer"
                      />
                      <label htmlFor="is_featured" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                        Feature on Home
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Pinned Order Index
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsOrderModalOpen(true)}
                        className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all flex items-center justify-center border border-primary/20 cursor-pointer shrink-0"
                        title="Manage Pinned Orders"
                        aria-label="Manage Pinned Orders"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={editingProject.pinned_order ?? 0}
                        onChange={e => setEditingProject(prev => prev ? ({ ...prev, pinned_order: parseInt(e.target.value) || 0 }) : null)}
                        className={cn(
                          "flex-1 min-w-0 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border text-foreground text-sm focus:outline-none transition-all",
                          editingProject.pinned_order && editingProject.pinned_order > 0 && projects.some(p => p.id !== editingProject.id && p.category === editingProject.category && p.pinned_order === editingProject.pinned_order)
                            ? "border-red-500 focus:border-red-500"
                            : "border-slate-300 dark:border-slate-700/50 focus:border-primary/50"
                        )}
                      />
                    </div>
                    {editingProject.pinned_order && editingProject.pinned_order > 0 && projects.some(p => p.id !== editingProject.id && p.category === editingProject.category && p.pinned_order === editingProject.pinned_order) && (
                      <p className="text-[10px] text-red-500 font-semibold leading-normal mt-1">
                        This index is already pinned in the current category!
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Publish Date */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Project Date (Publish Date)
                  </label>
                  <input
                    type="date"
                    value={editingProject.created_at ? editingProject.created_at.split('T')[0] : ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, created_at: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Controls chronological ordering on the public portfolio pages.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
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
                    <span>Save Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid listing */}
      {!editingProject && (
        <div className="space-y-6">
          {/* Top Level Category Tabs */}
          <div className="flex justify-center">
            <div className="flex p-1 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-md w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('data')
                  sessionStorage.setItem('project_admin_active_category', 'data')
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap",
                  activeCategory === 'data'
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-foreground/75 hover:text-foreground"
                )}
              >
                <Presentation className="w-3.5 h-3.5 shrink-0" />
                <span>Data Science</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('non-data')
                  sessionStorage.setItem('project_admin_active_category', 'non-data')
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-extrabold rounded-xl transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap",
                  activeCategory === 'non-data'
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-foreground/75 hover:text-foreground"
                )}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span>General Dev</span>
              </button>
            </div>
          </div>

          {/* Filtering */}
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Showing {filtered.length} projects
            </span>
          </div>

          {/* Subcategory Filters */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableFilters.map((subCategory) => (
              <button
                key={subCategory}
                type="button"
                onClick={() => setActiveSubCategory(subCategory)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
                  activeSubCategory === subCategory
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-foreground/80 hover:text-foreground"
                )}
              >
                {SUBCATEGORY_MAP[subCategory] || subCategory.replace(' Projects', '')}
              </button>
            ))}
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 space-y-3">
              <Coffee className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-extrabold text-foreground">No projects found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No items match your search. Create one by clicking the Add Project button above.
              </p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((proj) => (
                  <motion.div
                    layout="position"
                    key={proj.id}
                    initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-sm md:text-base leading-tight truncate text-foreground flex-1">
                          {proj.title}
                        </h3>
                        {proj.is_featured && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-black uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                          {proj.category === 'data' ? 'Data Science' : 'General Dev'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-bold">
                          {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
                        </span>
                        {proj.created_at && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground text-[10px] font-semibold">
                            {new Date(proj.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {proj.pinned_order !== null && proj.pinned_order !== undefined && proj.pinned_order > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                            Pin: {proj.pinned_order}
                          </span>
                        )}
                      </div>

                      {/* Cover image preview or placeholder */}
                      <div className="relative aspect-video w-full max-h-[140px] rounded-xl overflow-hidden bg-slate-950/40 border border-slate-200/10 dark:border-slate-800/10 mt-2 flex items-center justify-center shrink-0">
                        {proj.cover_image ? (
                          <>
                            {/* Ambient blur background */}
                            <BlurImage 
                              src={getDirectImageUrl(proj.cover_image, 400)} 
                              alt="" 
                              initialBlur="blur-xl opacity-0"
                              initialScale="scale-110"
                              loadedBlur="blur-xl opacity-30"
                              loadedScale="scale-110"
                              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                            />
                            {/* Contained foreground image */}
                            <BlurImage 
                              src={getDirectImageUrl(proj.cover_image, 400)} 
                              alt={proj.title} 
                              referrerPolicy="no-referrer"
                              className="max-w-full max-h-full object-contain relative z-10"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 flex flex-col items-center justify-center p-4">
                            <ImageIcon className="w-6 h-6 text-primary/20 mb-1" />
                            <span className="text-primary/25 font-black uppercase tracking-widest text-[8px] text-center leading-normal">
                              No Cover Image
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 pt-1 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {/* Actions footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
                      <div className="flex items-center gap-2">
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                            title="GitHub Repository"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {proj.demo_url && (
                          <a
                            href={proj.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {proj.slide_url && (
                          <a
                            href={proj.slide_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                            title="Presentation Deck"
                          >
                            <Presentation className="w-4 h-4" />
                          </a>
                        )}
                        {proj.embed_code && (
                          <span className="p-2 rounded-lg bg-white/5 text-primary flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                            <Layers className="w-3.5 h-3.5" />
                            Dashboard
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(proj)}
                          className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(proj.id)}
                          className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* Reorder Pinned Projects Modal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOrderModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-xl rounded-3xl border border-slate-200/10 dark:border-slate-800/10 bg-slate-900/95 dark:bg-slate-950/95 p-6 shadow-2xl text-foreground flex flex-col max-h-[85vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-foreground">
                      Manage Pinned Orders
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Category: {editingProject?.category === 'data' ? 'Data Science' : 'General Dev'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg text-muted-foreground">
                      Total: {orderModalList.length} Items
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOrderModalOpen(false)}
                      className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Modal Body / Scrollable List */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[200px]">
                  {orderModalList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No projects are currently pinned in this category.
                    </p>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {orderModalList.map((proj, idx) => {
                        const isCurrent = proj.id === (editingProject?.id || 'temp-current-id')
                        
                        return (
                          <motion.div
                            key={proj.id}
                            layout
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                              isCurrent
                                ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/5"
                                : "bg-slate-900/50 dark:bg-slate-950/40 border-slate-200/5 dark:border-slate-800/10 hover:border-slate-800/30"
                            )}
                          >
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem(idx, 'up')}
                                className={cn(
                                  "p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                                )}
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === orderModalList.length - 1}
                                onClick={() => moveItem(idx, 'down')}
                                className={cn(
                                  "p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                                )}
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Cover Image Thumbnail */}
                            <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative flex items-center justify-center border border-slate-800/50">
                              {proj.cover_image ? (
                                <BlurImage
                                  src={getDirectImageUrl(proj.cover_image, 100)}
                                  alt=""
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <FileCode className="w-4 h-4 text-muted-foreground/30" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={cn(
                                  "text-xs font-semibold truncate",
                                  isCurrent ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground"
                                )}>
                                  {proj.title}
                                </h4>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground/60 truncate">
                                {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 bg-slate-800 dark:bg-slate-900 text-muted-foreground text-[10px] font-mono rounded-lg border border-slate-700/30">
                                Order: {idx + 1}
                              </span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/10 dark:bg-slate-950/10 dark:border-slate-800/10">
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="py-2 px-4 rounded-xl text-xs font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSaveOrder}
                    className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-55"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Order</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Reorder Featured Projects Modal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isFeaturedOrderModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-xl rounded-3xl border border-slate-200/10 dark:border-slate-800/10 bg-slate-900/95 dark:bg-slate-950/95 p-6 shadow-2xl text-foreground flex flex-col max-h-[85vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-foreground">
                      Manage Featured Orders
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sort which projects show up first on the home page (Max 3/6 shown)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFeaturedOrderModalOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body / Scrollable List */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[200px]">
                  {featuredOrderList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No projects are currently featured on the home page.
                    </p>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {featuredOrderList.map((proj, idx) => {
                        const isCurrent = proj.id === (editingProject?.id || 'temp-current-id')
                        
                        return (
                          <motion.div
                            key={proj.id}
                            layout
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                              isCurrent
                                ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/5"
                                : "bg-slate-900/50 dark:bg-slate-950/40 border-slate-200/5 dark:border-slate-800/10 hover:border-slate-800/30"
                            )}
                          >
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveFeaturedItem(idx, 'up')}
                                className={cn(
                                  "p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                                )}
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === featuredOrderList.length - 1}
                                onClick={() => moveFeaturedItem(idx, 'down')}
                                className={cn(
                                  "p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                                )}
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Cover Image Thumbnail */}
                            <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative flex items-center justify-center border border-slate-800/50">
                              {proj.cover_image ? (
                                <BlurImage
                                  src={getDirectImageUrl(proj.cover_image, 100)}
                                  alt=""
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <FileCode className="w-4 h-4 text-muted-foreground/30" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={cn(
                                  "text-xs font-semibold truncate",
                                  isCurrent ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground"
                                )}>
                                  {proj.title}
                                </h4>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground/60 truncate">
                                {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 bg-slate-800 dark:bg-slate-900 text-muted-foreground text-[10px] font-mono rounded-lg border border-slate-700/30">
                                Order: {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => unfeatureProject(proj.id)}
                                className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                title="Remove from Featured"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/10 dark:bg-slate-950/10 dark:border-slate-800/10">
                  <button
                    type="button"
                    onClick={() => setIsFeaturedOrderModalOpen(false)}
                    className="py-2 px-4 rounded-xl text-xs font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSaveFeaturedOrder}
                    className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-55"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Order</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
