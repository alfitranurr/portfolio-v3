import * as React from 'react'
import { Certificate, SortField } from './types'

export function useCertificateFilters(
  certificates: Certificate[],
  search: string,
  activeCategory: string,
  sortField: SortField
) {
  const filteredAndSorted = React.useMemo(() => {
    const result = certificates.filter(cert => {
      const matchesCategory = activeCategory === 'All' || cert.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch = 
        cert.title.toLowerCase().includes(q) ||
        cert.issuer.toLowerCase().includes(q)
      
      return matchesCategory && matchesSearch
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
      }
      if (sortField === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortField === 'issuer') {
        return a.issuer.localeCompare(b.issuer)
      }
      return 0
    })

    return result
  }, [certificates, search, activeCategory, sortField])

  return filteredAndSorted
}
