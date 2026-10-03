import * as React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonText, SkeletonLines } from '@/components/ui/skeleton'
import {
  AdminPageHeaderSkeleton,
  AdminControlsPanelSkeleton,
  CategoryTabsSkeleton,
  SearchSortRowSkeleton,
  ControlsFooterSkeleton,
  PaginationSkeleton,
} from '@/components/admin/shared/AdminPageSkeleton'

// Default: kategori "Data Science", view grid, 12 per halaman
const SUBCATEGORY_CHIPS = ['w-[135px]', 'w-[118px]', 'w-[142px]', 'w-[163px]', 'w-[100px]', 'w-[196px]']

const CARDS = [
  { title: 'w-[85%]', tags: ['w-[84px]', 'w-[92px]'], links: 2 },
  { title: 'w-[90%]', tags: ['w-[84px]', 'w-[78px]'], links: 1 },
  { title: 'w-[85%]', tags: ['w-[84px]', 'w-[110px]'], links: 2 },
  { title: 'w-[80%]', tags: ['w-[84px]', 'w-[123px]'], links: 1 },
  { title: 'w-[90%]', tags: ['w-[84px]', 'w-[123px]'], links: 1 },
  { title: 'w-[80%]', tags: ['w-[84px]', 'w-[92px]'], links: 1 },
]

function ProjectCardSkeleton({ title, tags, links }: (typeof CARDS)[number]) {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-200/60 dark:border-slate-800/60 space-y-3 flex flex-col shimmer-card">
      {/* Judul (text-sm leading-tight) + badge Featured */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <SkeletonText size="sm" lineClassName="h-[17.5px]" className={title} />
        </div>
        <Skeleton className="h-[17.5px] w-[66px] rounded-full shrink-0" />
      </div>

      {/* Tag kategori / subkategori / pin (text-[10px] + py-0.5 = 19px) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((w, i) => (
          <Skeleton key={i} className={cn('h-[19px] rounded-md', w)} />
        ))}
        <Skeleton className="h-[19px] w-[38px] rounded-md" />
      </div>

      <Skeleton className="aspect-video w-full rounded-xl shrink-0" />

      {/* Deskripsi text-xs leading-relaxed line-clamp-2 */}
      <SkeletonLines lines={2} size="xs" lineClassName="h-[19.5px]" lastLineWidth="w-4/5" />

      {/* Footer: link + 4 aksi (p-2 + ikon w-4 = 32px) */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: links }).map((_, i) => (
            <Skeleton key={i} className="w-8 h-8 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-8 h-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminProjectsLoading() {
  return (
    <div className="space-y-8 w-full">
      <AdminPageHeaderSkeleton
        titleWidth="w-[198px] sm:w-[247px]"
        subtitleWidth="w-full sm:w-[652px]"
        subtitleWrapWidth="w-2/3"
        buttonWidth="w-[126px]"
      />

      <div className="space-y-4">
        <AdminControlsPanelSkeleton>
          <CategoryTabsSkeleton
            className="max-w-md"
            tabs={[{ icon: true, width: 'w-[78px]' }, { icon: true, width: 'w-[74px]' }]}
          />
          <SearchSortRowSkeleton placeholderWidth="w-[261px]" sortWidth="w-[182px]" activeView="grid" />
          <ControlsFooterSkeleton counterWidth="w-[136px]" chipWidths={SUBCATEGORY_CHIPS} />
        </AdminControlsPanelSkeleton>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 12 kartu = 1 halaman penuh (page size default) */}
          {[...CARDS, ...CARDS].map((card, i) => (
            <ProjectCardSkeleton key={i} {...card} />
          ))}
        </div>

        <PaginationSkeleton pages={2} />
      </div>
    </div>
  )
}
