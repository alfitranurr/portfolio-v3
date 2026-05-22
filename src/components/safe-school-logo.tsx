'use client'

import * as React from 'react'

interface SafeSchoolLogoProps {
  src: string
  alt: string
}

export function SafeSchoolLogo({ src, alt }: SafeSchoolLogoProps) {
  const [error, setError] = React.useState(false)

  if (error || !src) return null

  return (
    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-white p-1.5 flex items-center justify-center shrink-0 border border-slate-200/10 shadow-md">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}
