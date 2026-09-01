import * as React from 'react'
import { Skill, SortField } from './types'

export function useSkillsFilters(
  skills: Skill[],
  search: string,
  activeCategory: string,
  sortField: SortField
) {
  return React.useMemo(() => {
    const result = skills.filter(skill => {
      const matchesCategory = activeCategory === 'All' || skill.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch = skill.name.toLowerCase().includes(q)
      
      return matchesCategory && matchesSearch
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      }
      if (sortField === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortField === 'proficiency') {
        return (b.proficiency || 0) - (a.proficiency || 0)
      }
      return 0
    })

    return result
  }, [skills, search, activeCategory, sortField])
}
