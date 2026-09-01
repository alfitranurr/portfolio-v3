import * as React from 'react'
import { Education, SortField } from './types'

export function useEducationFilters(
  educationList: Education[],
  search: string,
  sortField: SortField
) {
  const filteredAndSorted = React.useMemo(() => {
    const result = educationList.filter(edu => {
      const q = search.toLowerCase()
      const matchesSearch = 
        edu.institution.toLowerCase().includes(q) ||
        edu.degree.toLowerCase().includes(q) ||
        (edu.field_of_study && edu.field_of_study.toLowerCase().includes(q)) ||
        (edu.location && edu.location.toLowerCase().includes(q))
      
      return matchesSearch
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      }
      if (sortField === 'institution') {
        return a.institution.localeCompare(b.institution)
      }
      if (sortField === 'degree') {
        return a.degree.localeCompare(b.degree)
      }
      return 0
    })

    return result
  }, [educationList, search, sortField])

  return filteredAndSorted
}
