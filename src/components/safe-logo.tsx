'use client'

import * as React from 'react'
import { getDirectImageUrl } from '@/lib/utils'

interface SafeLogoProps {
  src: string
  alt: string
}

export function SafeLogo({ src, alt }: SafeLogoProps) {
  const [error, setError] = React.useState(false)

  if (error || !src) return null

  // Optimize Drive URLs for fast loading at 200px resolution for small logos
  const processedSrc = getDirectImageUrl(src, 200)

  return (
    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-white p-1.5 flex items-center justify-center shrink-0 border border-slate-200/10 shadow-md">
      <img 
        src={processedSrc} 
        alt={alt} 
        className="w-full h-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}
