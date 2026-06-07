import * as React from 'react'
import { PhotosCrud } from '@/components/admin/photos-crud'
import { getPhotos } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminPhotosPage() {
  const photos = await getPhotos()

  return (
    <div className="w-full h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)] overflow-hidden overflow-x-hidden flex flex-col">
      <PhotosCrud initialPhotos={photos} />
    </div>
  )
}
