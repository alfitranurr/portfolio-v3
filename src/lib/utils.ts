import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDirectImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  const driveRegex = /https?:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/
  const match = url.match(driveRegex)
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`
  }
  return url
}

