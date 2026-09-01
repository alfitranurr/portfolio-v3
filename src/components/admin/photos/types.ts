import type { Photo } from '@/lib/types'

export type { Photo }

export interface PhotosCrudProps {
  initialPhotos: Photo[]
}

export const DEFAULT_PHOTO: Omit<Photo, 'id'> = {
  title: '',
  year: '',
  description: '',
  image_url: ''
}

export type ViewMode = 'grid' | 'table'
export type SortField = 'newest' | 'oldest' | 'title' | 'year'
