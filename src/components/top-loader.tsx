'use client'

import NextTopLoader from 'nextjs-toploader'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

export function TopLoader() {
  const { theme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const color = mounted && theme === 'dark' ? '#ffffff' : '#000000'

  return (
    <NextTopLoader
      color={color}
      initialPosition={0.05}
      crawlSpeed={150}
      height={2.5}
      crawl={true}
      showSpinner={false}
      easing="cubic-bezier(0.16, 1, 0.3, 1)"
      speed={300}
      shadow={`0 0 12px ${color}, 0 0 4px ${color}`}
    />
  )
}
