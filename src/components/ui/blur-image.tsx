'use client'

import * as React from 'react'
import Image, { ImageProps } from 'next/image'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { IMAGE_SIZES, isLoaderSupported } from '@/lib/image-variants'

export interface BlurImageProps extends Omit<ImageProps, 'src'> {
  src?: ImageProps['src'] | null
  initialBlur?: string
  initialScale?: string
  loadedBlur?: string
  loadedScale?: string
  /** Durasi fade-in (ms) saat gambar selesai dimuat */
  fadeDuration?: number
  /** Untuk background/thumbnail kecil: default `sizes` = varian terkecil */
  lowQuality?: boolean
  showSkeleton?: boolean
}

// Hover zoom kartu: 800ms + easeOutQuad — akselerasi landai, melambat bertahap sampai berhenti
// (lebih halus dari default Tailwind 500ms yang sudah ~95% selesai di 300ms)
const ZOOM_DURATION_MS = 800
const ZOOM_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

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
      fadeDuration = 300,
      width,
      height,
      fill,
      lowQuality = false,
      showSkeleton = true,
      style,
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
    // Link Google Drive → lh3.googleusercontent.com (lebar diatur oleh custom loader)
    const normalizedSrc = typeof src === 'string' ? getDirectImageUrl(src) : src
    // Varian Supabase / Drive / Unsplash → srcset responsif via custom loader.
    // Selain itu (data:, blob:, SVG, file lama non-varian) tampil apa adanya.
    const optimizable = isLoaderSupported(normalizedSrc)
    const isGoogleHosted = typeof normalizedSrc === 'string' && normalizedSrc.includes('googleusercontent.com')
    const effectiveSizes = lowQuality
      ? (props.sizes ?? IMAGE_SIZES.ambient)
      : (props.sizes ?? (useFill ? IMAGE_SIZES.card : undefined))

    const imageSrc = normalizedSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

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
          unoptimized={!optimizable}
          referrerPolicy={isGoogleHosted ? 'no-referrer' : undefined}
          // Transisi lewat inline style agar tidak tertimpa class `transition-*`/`duration-*`
          // dari consumer (tailwind-merge membuang class transisi yang bentrok).
          // Tailwind v4 `scale-*` / `group-hover:scale-*` menulis properti CSS `scale`
          // (bukan `transform`), jadi `scale` wajib ikut ditransisikan.
          style={{
            transitionProperty: 'opacity, filter, scale, transform',
            transitionDuration: `${fadeDuration}ms, ${fadeDuration}ms, ${ZOOM_DURATION_MS}ms, ${ZOOM_DURATION_MS}ms`,
            transitionTimingFunction: `ease-out, ease-out, ${ZOOM_EASING}, ${ZOOM_EASING}`,
            ...style,
          }}
          className={cn(
            // Layer GPU hanya selama kartu di-hover (hemat memori untuk grid besar)
            'group-hover:will-change-[scale]',
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
