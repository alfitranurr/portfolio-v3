'use client'

import * as React from 'react'
import { BlurImage } from '@/components/ui/blur-image'
import { IMAGE_SIZES } from '@/lib/image-variants'

interface SafeLogoProps {
  src: string
  alt: string
  /** Pakai background gelap untuk logo putih tertentu (dipakai di Experience). Default: true */
  detectDark?: boolean
}

export function SafeLogo({ src, alt, detectDark = true }: SafeLogoProps) {
  const [error, setError] = React.useState(false)

  if (error || !src) return null

  const isDarkLogo = detectDark && (alt.toLowerCase().includes('indef') || src.includes('edu-logo-1779640956114'))

  return (
    <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden p-1.5 flex items-center justify-center shrink-0 border border-slate-200/10 shadow-md ${isDarkLogo ? 'bg-zinc-950' : 'bg-white'}`}>
      <BlurImage
        src={src}
        alt={alt}
        sizes={IMAGE_SIZES.logo}
        className="w-full h-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}
