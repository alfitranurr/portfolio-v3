import * as React from 'react'
import { Photo, SortField } from './types'

export function usePhotosFilters(
  photos: Photo[],
  search: string,
  sortField: SortField
) {
  const deferredSearch = React.useDeferredValue(search)
  return React.useMemo(() => {
    const q = deferredSearch.toLowerCase()
    const result = photos.filter(photo => {
      const matchesSearch =
        photo.title?.toLowerCase().includes(q) ||
        photo.description?.toLowerCase().includes(q) ||
        photo.year?.toLowerCase().includes(q)
      return matchesSearch
    })

    result.sort((a, b) => {
      if (sortField === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
      if (sortField === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      }
      if (sortField === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      }
      if (sortField === 'year') {
        return (b.year || '').localeCompare(a.year || '')
      }
      return 0
    })

    return result
  }, [photos, deferredSearch, sortField])
}
