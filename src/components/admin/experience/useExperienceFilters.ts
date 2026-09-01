import * as React from 'react'
import { Experience, SortField } from './types'

export function useExperienceFilters(
  experienceList: Experience[],
  search: string,
  activeCategory: string,
  sortField: SortField
) {
  const filteredAndSorted = React.useMemo(() => {
    const result = experienceList.filter(exp => {
      const matchesCategory = activeCategory === 'All' || exp.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch = 
        exp.role.toLowerCase().includes(q) ||
        exp.company.toLowerCase().includes(q) ||
        (exp.location && exp.location.toLowerCase().includes(q))
      
      return matchesCategory && matchesSearch
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      }
      if (sortField === 'company') {
        return a.company.localeCompare(b.company)
      }
      if (sortField === 'role') {
        return a.role.localeCompare(b.role)
      }
      return 0
    })

    return result
  }, [experienceList, search, activeCategory, sortField])

  return filteredAndSorted
}
