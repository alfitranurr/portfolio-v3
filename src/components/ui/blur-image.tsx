'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  initialBlur?: string
  initialScale?: string
  loadedBlur?: string
  loadedScale?: string
  transitionDuration?: string
}

export const BlurImage = React.forwardRef<HTMLImageElement, BlurImageProps>(
  (
    {
      className,
      onLoad,
      initialBlur = 'blur-md',
      initialScale = 'scale-102',
      loadedBlur = 'blur-0',
      loadedScale = 'scale-100',
      transitionDuration = 'duration-500',
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

    return (
      <img
        ref={localRef}
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
