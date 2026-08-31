import * as React from 'react'
import { PhotosCrud } from '@/components/admin/photos-crud'
import { getPhotos } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminPhotosPage() {
  const photos = await getPhotos()

  return <PhotosCrud initialPhotos={photos} />
}
