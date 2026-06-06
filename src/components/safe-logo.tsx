'use client'

import * as React from 'react'
import { getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'

interface SafeLogoProps {
  src: string
  alt: string
}

export function SafeLogo({ src, alt }: SafeLogoProps) {
  const [error, setError] = React.useState(false)

  if (error || !src) return null

  // Optimize Drive URLs for fast loading at 200px resolution for small logos
  const processedSrc = getDirectImageUrl(src, 200)

  const isDarkLogo = alt.toLowerCase().includes('indef') || src.includes('edu-logo-1779640956114')

  return (
    <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden p-1.5 flex items-center justify-center shrink-0 border border-slate-200/10 shadow-md ${isDarkLogo ? 'bg-zinc-950' : 'bg-white'}`}>
      <BlurImage 
        src={processedSrc} 
        alt={alt} 
        className="w-full h-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}
