'use client'

import * as React from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

export interface BlurImageProps extends Omit<ImageProps, 'src'> {
  src?: string | any | null
  initialBlur?: string
  initialScale?: string
  loadedBlur?: string
  loadedScale?: string
  transitionDuration?: string
}

// Check if image domain is local, Supabase, or Google Drive (Google User Content)
const isOptimizable = (src: any) => {
  if (typeof src === 'string') {
    return src.startsWith('/') || src.includes('supabase.co') || src.includes('googleusercontent.com')
  }
  return true; // Statically imported objects are always optimizable
}

export const BlurImage = React.forwardRef<HTMLImageElement, BlurImageProps>(
  (
    {
      className,
      src,
      alt = '',
      onLoad,
      initialBlur = 'blur-md',
      initialScale = 'scale-102',
      loadedBlur = 'blur-0',
      loadedScale = 'scale-100',
      transitionDuration = 'duration-500',
      width,
      height,
      fill,
      quality = 85,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = React.useState(false)
    const localRef = React.useRef<HTMLImageElement>(null)

    // Forward ref to localRef
    React.useImperativeHandle(ref, () => localRef.current!)

    React.useEffect(() => {
      if (localRef.current && localRef.current.complete) {
        setIsLoaded(true)
      }
    }, [])

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true)
      if (onLoad) {
        onLoad(e)
      }
    }

    const hasDimensions = width !== undefined && height !== undefined
    const useFill = fill ?? !hasDimensions
    const optimizable = isOptimizable(src)
    
    // Fallback to transparent 1x1 pixel image to prevent network errors/crashes
    const imageSrc = src || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    return (
      <Image
        ref={localRef}
        src={imageSrc}
        alt={alt || ''}
        width={!useFill ? Number(width) : undefined}
        height={!useFill ? Number(height) : undefined}
        fill={useFill}
        quality={quality}
        unoptimized={!optimizable}
        className={cn(
          "transition-all ease-out",
          transitionDuration,
          !isLoaded ? `${initialBlur} ${initialScale}` : `${loadedBlur} ${loadedScale}`,
          className
        )}
        onLoad={handleLoad}
        {...props}
      />
    )
  }
)
BlurImage.displayName = 'BlurImage'
