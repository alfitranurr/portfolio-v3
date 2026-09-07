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

export function formatDuration(startDateStr: string, endDateStr: string | null) {
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

const SUB_CATEGORY_COLOR_MAP: Record<string, { text: string; badge: string }> = {
  'Data Visualization Projects': {
    text: 'text-cyan-500 dark:text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
  },
  'Data Analytics Projects': {
    text: 'text-blue-500 dark:text-blue-400',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  },
  'Artificial Intelligence Projects': {
    text: 'text-purple-500 dark:text-purple-400',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  },
  'Automation Projects': {
    text: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  },
  'Data Automation Projects': {
    text: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  },
  'Data Modeling and Simulation Projects': {
    text: 'text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  },
  'Web Development Projects': {
    text: 'text-rose-500 dark:text-rose-400',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  },
  'Mobile Development Projects': {
    text: 'text-pink-500 dark:text-pink-400',
    badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
  },
  'Digital Marketing Projects': {
    text: 'text-orange-500 dark:text-orange-400',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  },
  'Graphic Design Projects': {
    text: 'text-indigo-500 dark:text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  },
}

const DEFAULT_SUB_CATEGORY_COLOR = {
  text: 'text-primary',
  badge: 'bg-primary/10 text-primary border border-primary/20',
}

export function getSubCategoryColor(subCategory: string): { text: string; badge: string } {
  return SUB_CATEGORY_COLOR_MAP[subCategory] || DEFAULT_SUB_CATEGORY_COLOR
}
