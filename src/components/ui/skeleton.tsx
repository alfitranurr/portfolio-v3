import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Primitif skeleton. Skeleton halaman dibuat dengan menyalin markup komponen aslinya
 * (class container / grid / padding / rounded yang sama) lalu mengganti:
 *   - teks  → <SkeletonText size="…">   (tinggi kotak = line-height Tailwind teks aslinya)
 *   - media → <Skeleton className="aspect-video …"> (rasio / ukuran sama)
 * sehingga saat konten asli muncul tidak ada lompatan layout.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('shimmer-placeholder rounded-xl select-none pointer-events-none', className)}
      {...props}
    />
  )
}

/** Ukuran teks Tailwind → tinggi kotak baris (line-height default) dan tinggi bar di dalamnya. */
const LINE_HEIGHT = {
  '3xs': 'h-[13.5px]', // text-[9px]
  '2xs': 'h-[15px]', //   text-[10px]
  xs: 'h-4', //            text-xs   (12/16)
  sm: 'h-5', //            text-sm   (14/20)
  base: 'h-6', //          text-base (16/24)
  lg: 'h-7', //            text-lg   (18/28)
  xl: 'h-7', //            text-xl   (20/28)
  '2xl': 'h-8', //         text-2xl  (24/32)
  '3xl': 'h-9', //         text-3xl  (30/36)
  '4xl': 'h-10', //        text-4xl  (36/40)
} as const

const BAR_HEIGHT = {
  '3xs': 'h-2',
  '2xs': 'h-2',
  xs: 'h-2.5',
  sm: 'h-3',
  base: 'h-3.5',
  lg: 'h-4',
  xl: 'h-4.5',
  '2xl': 'h-5',
  '3xl': 'h-6',
  '4xl': 'h-7',
} as const

export type SkeletonTextSize = keyof typeof LINE_HEIGHT

interface SkeletonTextProps {
  /** Ukuran teks asli (menentukan tinggi baris & bar) */
  size?: SkeletonTextSize
  /** Class untuk bar (lebar, mis. "w-40"; atau override tinggi bar responsif) */
  className?: string
  /** Override tinggi baris, mis. untuk `leading-snug` atau ukuran responsif ("h-8 md:h-10") */
  lineClassName?: string
}

/** Satu baris teks: kotak setinggi line-height dengan bar di tengah (tanpa margin collapse). */
export function SkeletonText({ size = 'sm', className, lineClassName }: SkeletonTextProps) {
  return (
    <div aria-hidden="true" className={cn('flex items-center', LINE_HEIGHT[size], lineClassName)}>
      <Skeleton className={cn('rounded-md', BAR_HEIGHT[size], className ?? 'w-full')} />
    </div>
  )
}

interface SkeletonLinesProps extends Omit<SkeletonTextProps, 'className'> {
  /** Jumlah baris */
  lines: number
  /** Lebar baris terakhir (baris lain penuh) */
  lastLineWidth?: string
  className?: string
}

/** Paragraf beberapa baris (tanpa jarak antarbaris — persis seperti teks asli). */
export function SkeletonLines({ lines, size = 'sm', lastLineWidth = 'w-3/5', lineClassName, className }: SkeletonLinesProps) {
  return (
    <div aria-hidden="true" className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          size={size}
          lineClassName={lineClassName}
          className={i === lines - 1 && lines > 1 ? lastLineWidth : 'w-full'}
        />
      ))}
    </div>
  )
}
