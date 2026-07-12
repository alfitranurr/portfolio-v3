import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDirectImageUrl(url: string | null | undefined, width: number = 1000): string {
  if (!url) return ''
  const driveRegex = /https?:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/
  const match = url.match(driveRegex)
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`
  }
  return url
}

export function formatDuration(startDateStr: string, endDateStr: string | null, isCurrent: boolean = false) {
  const start = new Date(startDateStr)
  const end = endDateStr ? new Date(endDateStr) : new Date()
  
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  
  if (months < 0) {
    years -= 1
    months += 12
  }
  
  months += 1
  if (months >= 12) {
    years += 1
    months -= 12
  }
  
  const parts: string[] = []
  if (years > 0) {
    parts.push(`${years} yr${years > 1 ? 's' : ''}`)
  }
  if (months > 0) {
    parts.push(`${months} mo${months > 1 ? 's' : ''}`)
  }
  
  return parts.join(' ') || '1 mo'
}

