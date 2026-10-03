import * as React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

/*
 * Potongan skeleton bersama untuk halaman CRUD admin (projects, certificates, education,
 * experience, photos, skills). Markup & class disalin dari komponen aslinya.
 * Catatan line-height: `text-xs` Tailwind v4 memakai rasio (4/3) yang diwarisi elemen anak,
 * jadi teks text-[10px]/[11px]/[9px] di dalam tabel = 13.333px / 14.667px / 12px.
 */

const PANEL = 'glass-panel border border-slate-200/10 dark:border-slate-800/10'

/* ---------------------------------- Header ---------------------------------- */

interface AdminPageHeaderSkeletonProps {
  /** Lebar judul, mis. "w-[198px] sm:w-[247px]" (text-2xl → sm:text-3xl) */
  titleWidth: string
  /** Lebar baris subjudul (sm+: satu baris text-sm), mis. "w-full sm:w-[652px]" */
  subtitleWidth: string
  /** Baris kedua subjudul di mobile (text-xs membungkus), mis. "w-2/3" */
  subtitleWrapWidth?: string
  /** Lebar tombol "Add …", mis. "w-[126px]" */
  buttonWidth: string
}

/** Card header: ikon + judul + subjudul + tombol "Add …" */
export function AdminPageHeaderSkeleton({ titleWidth, subtitleWidth, subtitleWrapWidth, buttonWidth }: AdminPageHeaderSkeletonProps) {
  return (
    <div className={cn('p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shimmer-card', PANEL)}>
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="space-y-1 z-10">
        <div className="flex items-center gap-2.5">
          {/* p-2 + ikon w-5 + border = 38px */}
          <Skeleton className="w-[38px] h-[38px] rounded-xl shrink-0" />
          <SkeletonText size="2xl" lineClassName="h-8 sm:h-9" className={cn('h-5 sm:h-6 max-w-full', titleWidth)} />
        </div>
        <div className="pt-0.5">
          <SkeletonText size="xs" lineClassName="sm:h-5" className={cn('sm:h-3 max-w-full', subtitleWidth)} />
          {subtitleWrapWidth && <SkeletonText size="xs" lineClassName="sm:hidden" className={subtitleWrapWidth} />}
        </div>
      </div>

      {/* py-2.5 + text-xs = 36px */}
      <Skeleton className={cn('h-9 rounded-xl shrink-0 self-start sm:self-center z-10', buttonWidth)} />
    </div>
  )
}

/* --------------------------------- Controls --------------------------------- */

/** Panel kontrol (tab kategori, search/sort/view, counter) */
export function AdminControlsPanelSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn('p-4 rounded-2xl space-y-4 relative z-30 shimmer-card', PANEL)}>
      {children}
    </div>
  )
}

export interface CategoryTabSkeleton {
  /** Lebar label, mis. "w-[82px]" */
  width: string
  /** Tab punya ikon w-3.5 */
  icon?: boolean
}

interface CategoryTabsSkeletonProps {
  tabs: CategoryTabSkeleton[]
  /** Class container asli (max-w-*, flex-wrap, gap) */
  className?: string
  /** Class tambahan tombol (mis. "min-w-[120px] px-3") */
  tabClassName?: string
}

/** Switcher kategori; tab pertama aktif (blok penuh, isi tak terlihat agar lebar sama) */
export function CategoryTabsSkeleton({ tabs, className, tabClassName }: CategoryTabsSkeletonProps) {
  return (
    <div className="flex justify-center">
      <div className={cn('flex p-1 rounded-2xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 w-full relative', className)}>
        {tabs.map((tab, i) => {
          const tabClass = cn('flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap', tabClassName)
          const content = (
            <>
              {tab.icon && <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />}
              <SkeletonText size="xs" lineClassName="min-w-0" className={cn('max-w-full', tab.width)} />
            </>
          )
          return i === 0 ? (
            <Skeleton key={i} className={tabClass}>
              <div className="invisible flex items-center gap-1.5 min-w-0">{content}</div>
            </Skeleton>
          ) : (
            <div key={i} className={tabClass}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}

interface SearchSortRowSkeletonProps {
  /** Lebar placeholder search, mis. "w-[261px]" */
  placeholderWidth: string
  /** Lebar dropdown sort, mis. "w-[177px]" */
  sortWidth?: string
  /** View mode aktif (default fitur) */
  activeView: 'grid' | 'table'
}

/** Baris search + sort dropdown + view switcher */
export function SearchSortRowSkeleton({ placeholderWidth, sortWidth = 'w-[177px]', activeView }: SearchSortRowSkeletonProps) {
  const viewButton = (active: boolean, key: string) =>
    active ? (
      <Skeleton key={key} className="w-7 h-7 rounded-lg" />
    ) : (
      <div key={key} className="p-1.5">
        <Skeleton className="w-4 h-4 rounded" />
      </div>
    )

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Skeleton className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded" />
        {/* py-2.5 + text-xs + border = 38px */}
        <div className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/85 dark:bg-white/5 border border-slate-300 dark:border-slate-700/50">
          <SkeletonText size="xs" className={cn('max-w-full', placeholderWidth)} />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* px-3.5 py-2 + text-xs + border = 34px */}
        <Skeleton className={cn('h-[34px] rounded-2xl', sortWidth)} />
        <div className="flex items-center p-1 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-slate-700/60 shadow-2xs">
          {viewButton(activeView === 'grid', 'grid')}
          {viewButton(activeView === 'table', 'table')}
        </div>
      </div>
    </div>
  )
}

interface ControlsFooterSkeletonProps {
  /** Lebar teks "Showing X of Y …" (text-[11px]) */
  counterWidth: string
  /** Lebar chip subkategori (projects); kosong = hanya counter rata kanan */
  chipWidths?: string[]
}

/** Baris bawah panel kontrol: chip subkategori (opsional) + counter */
export function ControlsFooterSkeleton({ counterWidth, chipWidths }: ControlsFooterSkeletonProps) {
  const counter = <SkeletonText size="2xs" lineClassName="h-[16.5px] shrink-0" className={counterWidth} />

  if (!chipWidths?.length) {
    return (
      <div className="flex items-center justify-end pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
        {counter}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/5 dark:border-slate-800/5">
      <div className="flex flex-wrap gap-1.5">
        {/* px-3 py-1.5 + text-[10px] + border = 29px */}
        {chipWidths.map((w, i) => (
          <Skeleton key={i} className={cn('h-[29px] rounded-xl', w)} />
        ))}
      </div>
      {counter}
    </div>
  )
}

/* ---------------------------------- Table ----------------------------------- */

export interface TableColumnSkeleton {
  /** Class <th> asli */
  className: string
  /** Lebar label header */
  width: string
}

/** Wrapper tabel admin (rounded-2xl glass-panel, min-w-[750px], header 10px uppercase) */
export function AdminTableSkeleton({ columns, children }: { columns: TableColumnSkeleton[]; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden shadow-sm relative z-10 w-full shimmer-card', PANEL)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-xs table-auto">
          <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 text-[10px]">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={col.className}>
                  <SkeletonText
                    size="2xs"
                    lineClassName={cn('h-[13.333px]', col.className.includes('text-center') && 'justify-center')}
                    className={col.width}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Kolom nomor (text-[11px] mono) */
export function TableIndexCell({ wide }: { wide?: boolean }) {
  return (
    <td className="py-2.5 px-3 text-center">
      <SkeletonText size="2xs" lineClassName="h-[14.667px] justify-center" className={wide ? 'w-3.5' : 'w-2'} />
    </td>
  )
}

/** Kolom thumbnail 40px + judul (text-xs leading-snug) + subjudul opsional (text-[10px]) */
export function TableThumbCell({ titleWidth, subtitleWidth }: { titleWidth: string; subtitleWidth?: string }) {
  return (
    <td className="py-2.5 px-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="space-y-0.5 min-w-0 flex-1">
          <SkeletonText size="xs" lineClassName="h-[16.5px]" className={cn('max-w-full', titleWidth)} />
          {subtitleWidth && <SkeletonText size="2xs" lineClassName="h-[13.333px]" className={cn('max-w-full', subtitleWidth)} />}
        </div>
      </div>
    </td>
  )
}

/** Badge kategori (px-2 py-0.5 text-[10px] border, rounded-md) */
export function TableBadgeCell({ width }: { width: string }) {
  return (
    <td className="py-2.5 px-3 whitespace-nowrap text-center">
      <Skeleton className={cn('inline-block align-middle h-[19px] rounded-md', width)} />
    </td>
  )
}

/** Teks satu baris text-[11px] */
export function TableTextCell({ width, center = true }: { width: string; center?: boolean }) {
  return (
    <td className={cn('py-2.5 px-3 whitespace-nowrap', center && 'text-center')}>
      <SkeletonText size="2xs" lineClassName={cn('h-[14.667px]', center && 'justify-center')} className={width} />
    </td>
  )
}

/** Periode 3 baris: tanggal / "-" / tanggal (text-[11px] mono, gap-0.5) */
export function TablePeriodCell({ endWidth = 'w-[53px]' }: { endWidth?: string }) {
  return (
    <td className="py-2.5 px-3 whitespace-nowrap text-center">
      <div className="flex flex-col items-center gap-0.5">
        <SkeletonText size="2xs" lineClassName="h-[14.667px]" className="w-[53px]" />
        <SkeletonText size="3xs" lineClassName="h-3" className="w-1.5 h-0.5" />
        <SkeletonText size="2xs" lineClassName="h-[14.667px]" className={endWidth} />
      </div>
    </td>
  )
}

/** Tombol aksi p-1.5 + ikon w-3.5 + border = 28px */
export function TableActionsCell({ count = 4 }: { count?: number }) {
  return (
    <td className="py-2.5 px-3 text-center whitespace-nowrap">
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="w-7 h-7 rounded-lg" />
        ))}
      </div>
    </td>
  )
}

/* -------------------------------- Pagination -------------------------------- */

/** Bar pagination (hanya dirender aslinya saat totalPages > 1) */
export function PaginationSkeleton({ pages, summaryWidth = 'w-[117px]' }: { pages: number; summaryWidth?: string }) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl shimmer-card', PANEL)}>
      <div className="flex items-center gap-2">
        <SkeletonText size="xs" className="w-[58px]" />
        <Skeleton className="h-7 w-14 rounded-lg" />
        <SkeletonText size="xs" className={summaryWidth} />
      </div>

      <div className="flex items-center gap-1.5">
        {/* p-2 + ikon w-4 + border = 34px */}
        <Skeleton className="w-[34px] h-[34px] rounded-xl" />
        <div className="flex items-center gap-1">
          {Array.from({ length: pages }).map((_, i) => (
            <Skeleton key={i} className="w-8 h-8 rounded-xl" />
          ))}
        </div>
        <Skeleton className="w-[34px] h-[34px] rounded-xl" />
      </div>
    </div>
  )
}
