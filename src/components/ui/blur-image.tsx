'use client'

import * as React from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

export interface BlurImageProps extends Omit<ImageProps, 'src'> {
  src?: ImageProps['src'] | null
  initialBlur?: string
  initialScale?: string
  loadedBlur?: string
  loadedScale?: string
  transitionDuration?: string
  lowQuality?: boolean
  showSkeleton?: boolean
}

// Check if image domain is local, Supabase, or Google Drive (Google User Content)
const isOptimizable = (src: unknown) => {
  if (typeof src === 'string') {
    return src.startsWith('/') || src.includes('supabase.co') || src.includes('googleusercontent.com') || src.includes('unsplash.com')
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
      lowQuality = false,
      showSkeleton = true,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = React.useState(false)
    const localRef = React.useRef<HTMLImageElement>(null)

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
    const effectiveQuality = lowQuality ? 30 : quality
    const effectiveSizes = lowQuality
      ? (props.sizes ?? "50px")
      : (props.sizes ?? (useFill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined))

    const imageSrc = src || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    return (
      <>
        {showSkeleton && !isLoaded && (
          <span
            className="absolute inset-0 z-0 rounded-[inherit] bg-gradient-to-br from-slate-200/40 via-slate-100/30 to-slate-200/40 dark:from-slate-800/40 dark:via-slate-700/30 dark:to-slate-800/40 animate-pulse pointer-events-none"
            aria-hidden="true"
          />
        )}
        <Image
          ref={localRef}
          src={imageSrc}
          alt={alt || ''}
          width={!useFill ? Number(width) : undefined}
          height={!useFill ? Number(height) : undefined}
          fill={useFill}
          sizes={effectiveSizes}
          quality={effectiveQuality}
          unoptimized={!optimizable}
          className={cn(
            "transition-all ease-out",
            transitionDuration,
            !isLoaded ? `${initialBlur} ${initialScale} opacity-0` : `${loadedBlur} ${loadedScale} opacity-100`,
            className
          )}
          onLoad={handleLoad}
          {...props}
        />
      </>
    )
  }
)
BlurImage.displayName = 'BlurImage'
