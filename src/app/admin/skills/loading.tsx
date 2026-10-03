import * as React from 'react'
import { SkeletonText } from '@/components/ui/skeleton'
import {
  AdminPageHeaderSkeleton,
  AdminControlsPanelSkeleton,
  SearchSortRowSkeleton,
  ControlsFooterSkeleton,
  AdminTableSkeleton,
  TableIndexCell,
  TableThumbCell,
  TableTextCell,
  TableActionsCell,
  PaginationSkeleton,
} from '@/components/admin/shared/AdminPageSkeleton'

// Default: view tabel, 10 per halaman
const COLUMNS = [
  { className: 'py-2.5 px-3 w-10 text-center', width: 'w-1.5' },
  { className: 'py-2.5 px-3 min-w-[200px]', width: 'w-[62px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[72px]' },
  { className: 'py-2.5 px-3 min-w-[250px]', width: 'w-[72px]' },
  { className: 'py-2.5 px-3 text-center whitespace-nowrap w-36', width: 'w-[49px]' },
]

const NAME_WIDTHS = ['w-[44px]', 'w-[70px]', 'w-[62px]', 'w-[52px]', 'w-[24px]', 'w-[60px]', 'w-[65px]', 'w-[41px]', 'w-[39px]', 'w-[26px]']

export default function AdminSkillsLoading() {
  return (
    <div className="space-y-8 w-full">
      <AdminPageHeaderSkeleton
        titleWidth="w-[64px] sm:w-[80px]"
        subtitleWidth="w-[262px] sm:w-[306px]"
        buttonWidth="w-[108px]"
      />

      <div className="space-y-4">
        <AdminControlsPanelSkeleton>
          <SearchSortRowSkeleton placeholderWidth="w-[131px]" activeView="table" />
          <ControlsFooterSkeleton counterWidth="w-[120px]" />
        </AdminControlsPanelSkeleton>

        <AdminTableSkeleton columns={COLUMNS}>
          {NAME_WIDTHS.map((w, i) => (
            <tr key={i}>
              <TableIndexCell wide={i >= 9} />
              <TableThumbCell titleWidth={w} />
              <TableTextCell width="w-1.5" />
              {/* Deskripsi text-[11px] leading-relaxed line-clamp-2 max-w-[250px] */}
              <td className="py-2.5 px-3">
                <div className="max-w-[250px]">
                  <SkeletonText size="2xs" lineClassName="h-[17.875px]" className="w-[81px]" />
                </div>
              </td>
              <TableActionsCell count={3} />
            </tr>
          ))}
        </AdminTableSkeleton>

        <PaginationSkeleton pages={3} summaryWidth="w-[116px]" />
      </div>
    </div>
  )
}
