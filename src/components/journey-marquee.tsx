'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Photo } from '@/lib/types'
import { BlurImage } from '@/components/ui/blur-image'

interface JourneyMarqueeProps {
  initialPhotos: Photo[]
}

export function JourneyMarquee({ initialPhotos }: JourneyMarqueeProps) {
  const photos = initialPhotos && initialPhotos.length > 0 ? initialPhotos : []

  // Loop the same items in different offset orders for each column to make them look distinct
  const col1 = [...photos]
  const col2 = photos.length > 1
    ? [...photos.slice(Math.floor(photos.length / 3)), ...photos.slice(0, Math.floor(photos.length / 3))]
    : [...photos]
  const col3 = photos.length > 2
    ? [...photos.slice(Math.floor(2 * photos.length / 3)), ...photos.slice(0, Math.floor(2 * photos.length / 3))]
    : [...photos]

  // Repeat items to ensure smooth loop
  const getRepeatedItems = (items: Photo[]) => {
    if (items.length === 0) return []
    const repeatCount = Math.max(2, Math.ceil(8 / items.length))
    const repeated: Photo[] = []
    for (let i = 0; i < repeatCount; i++) {
      repeated.push(...items)
    }
    return repeated
  }

  const column1 = getRepeatedItems(col1)
  const column2 = getRepeatedItems(col2)
  const column3 = getRepeatedItems(col3)

  const renderCard = (item: Photo, index: number, colPrefix: string) => {
    return (
      <div
        key={`${colPrefix}-${index}`}
        className="mb-6 h-[240px] w-full rounded-3xl glass-panel relative overflow-hidden group hover:border-primary/20 hover:scale-[1.03] transition-all duration-300"
      >
        <BlurImage
          src={item.image_url}
          alt={item.title || 'Recap image'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="py-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5">
        <p className="text-xs text-muted-foreground">No photos found. Add photos in the admin panel.</p>
      </div>
    )
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative overflow-hidden py-2 marquee-vertical-container"
      style={{ height: '480px' }}
    >
      {/* Top and Bottom Gradient Overlays for 100% seamless fade-out */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
      
      {/* Column 1: Upward */}
      <div className="overflow-hidden relative marquee-column" style={{ height: '100%' }}>
        <div
          className="flex flex-col animate-marquee-up"
          style={{ '--marquee-duration': '110s' } as React.CSSProperties}
        >
          <div className="flex flex-col shrink-0">
            {column1.map((item, idx) => renderCard(item, idx, 'col1-orig'))}
          </div>
          <div className="flex flex-col shrink-0" aria-hidden="true">
            {column1.map((item, idx) => renderCard(item, idx, 'col1-dup'))}
          </div>
        </div>
      </div>

      {/* Column 2: Downward */}
      <div className="overflow-hidden relative hidden md:block marquee-column" style={{ height: '100%' }}>
        <div
          className="flex flex-col animate-marquee-down"
          style={{ '--marquee-duration': '120s' } as React.CSSProperties}
        >
          <div className="flex flex-col shrink-0">
            {column2.map((item, idx) => renderCard(item, idx, 'col2-orig'))}
          </div>
          <div className="flex flex-col shrink-0" aria-hidden="true">
            {column2.map((item, idx) => renderCard(item, idx, 'col2-dup'))}
          </div>
        </div>
      </div>

      {/* Column 3: Upward */}
      <div className="overflow-hidden relative hidden lg:block marquee-column" style={{ height: '100%' }}>
        <div
          className="flex flex-col animate-marquee-up"
          style={{ '--marquee-duration': '100s' } as React.CSSProperties}
        >
          <div className="flex flex-col shrink-0">
            {column3.map((item, idx) => renderCard(item, idx, 'col3-orig'))}
          </div>
          <div className="flex flex-col shrink-0" aria-hidden="true">
            {column3.map((item, idx) => renderCard(item, idx, 'col3-dup'))}
          </div>
        </div>
      </div>
    </div>
  )
}
