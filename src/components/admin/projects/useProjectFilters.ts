import * as React from 'react'
import { Project } from './types'

export function useProjectFilters(
  projects: Project[],
  activeCategory: 'data' | 'non-data',
  search: string,
  activeSubCategory: string,
  sortField: 'pinned' | 'featured' | 'newest' | 'oldest' | 'title'
) {
  const filteredAndSorted = React.useMemo(() => {
    const result = projects.filter(p => {
      const matchesCategory = p.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch = 
        p.title.toLowerCase().includes(q) ||
        p.sub_category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      
      const normalizedProjSub = p.sub_category === 'Data Automation Projects' ? 'Automation Projects' : p.sub_category
      const normalizedActiveSub = activeSubCategory === 'Data Automation Projects' ? 'Automation Projects' : activeSubCategory

      const matchesSubCategory = normalizedActiveSub === 'All' || normalizedProjSub === normalizedActiveSub
      return matchesCategory && matchesSearch && matchesSubCategory
    })

    result.sort((a, b) => {
      if (sortField === 'pinned') {
        return (a.pinned_order || 999) - (b.pinned_order || 999)
      }
      if (sortField === 'featured') {
        if (a.is_featured !== b.is_featured) {
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        }
        return (a.featured_order || a.pinned_order || 999) - (b.featured_order || b.pinned_order || 999)
      }
      if (sortField === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      }
      if (sortField === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return result
  }, [projects, activeCategory, search, activeSubCategory, sortField])

  return filteredAndSorted
}
