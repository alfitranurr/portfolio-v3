import * as React from 'react'
import {
  AdminPageHeaderSkeleton,
  AdminControlsPanelSkeleton,
  CategoryTabsSkeleton,
  SearchSortRowSkeleton,
  ControlsFooterSkeleton,
  AdminTableSkeleton,
  TableIndexCell,
  TableThumbCell,
  TableBadgeCell,
  TableTextCell,
  TableActionsCell,
  PaginationSkeleton,
} from '@/components/admin/shared/AdminPageSkeleton'

// Default: kategori "All", view tabel, 12 per halaman
const COLUMNS = [
  { className: 'py-2.5 px-3 w-10 text-center', width: 'w-1.5' },
  { className: 'py-2.5 px-3 min-w-[200px]', width: 'w-[68px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[58px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[61px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[66px]' },
  { className: 'py-2.5 px-3 text-center whitespace-nowrap w-36', width: 'w-[49px]' },
]

const ROWS = [
  { title: 'w-[268px]', subtitle: 'w-[166px]', badge: 'w-[144px]' },
  { title: 'w-[314px]', subtitle: 'w-[26px]', badge: 'w-[144px]' },
  { title: 'w-[362px]', subtitle: 'w-[34px]', badge: 'w-[144px]' },
  { title: 'w-[274px]', subtitle: 'w-[34px]', badge: 'w-[144px]' },
  { title: 'w-[348px]', subtitle: 'w-[226px]', badge: 'w-[144px]' },
  { title: 'w-[167px]', subtitle: 'w-[58px]', badge: 'w-[144px]' },
  { title: 'w-[290px]', subtitle: 'w-[246px]', badge: 'w-[129px]' },
  { title: 'w-[237px]', subtitle: 'w-[189px]', badge: 'w-[88px]' },
  { title: 'w-[326px]', subtitle: 'w-[262px]', badge: 'w-[88px]' },
  { title: 'w-[366px]', subtitle: 'w-[311px]', badge: 'w-[88px]' },
  { title: 'w-[370px]', subtitle: 'w-[370px]', badge: 'w-[88px]' },
  { title: 'w-[356px]', subtitle: 'w-[296px]', badge: 'w-[88px]' },
]

export default function AdminCertificatesLoading() {
  return (
    <div className="space-y-8 w-full">
      <AdminPageHeaderSkeleton
        titleWidth="w-[262px] sm:w-[327px]"
        subtitleWidth="w-full sm:w-[567px]"
        subtitleWrapWidth="w-1/2"
        buttonWidth="w-[148px]"
      />

      <div className="space-y-4">
        <AdminControlsPanelSkeleton>
          <CategoryTabsSkeleton
            className="flex-wrap max-w-4xl gap-1"
            tabClassName="min-w-[120px] px-3"
            tabs={[
              { width: 'w-[92px]' },
              { icon: true, width: 'w-[86px]' },
              { icon: true, width: 'w-[124px]' },
              { icon: true, width: 'w-[124px]' },
              { icon: true, width: 'w-[124px]' },
            ]}
          />
          <SearchSortRowSkeleton placeholderWidth="w-[147px]" activeView="table" />
          <ControlsFooterSkeleton counterWidth="w-[157px]" />
        </AdminControlsPanelSkeleton>

        <AdminTableSkeleton columns={COLUMNS}>
          {ROWS.map((row, i) => (
            <tr key={i}>
              <TableIndexCell wide={i >= 9} />
              <TableThumbCell titleWidth={row.title} subtitleWidth={row.subtitle} />
              <TableBadgeCell width={row.badge} />
              <TableTextCell width="w-[53px]" />
              <TableTextCell width="w-1.5" />
              <TableActionsCell />
            </tr>
          ))}
        </AdminTableSkeleton>

        <PaginationSkeleton pages={5} />
      </div>
    </div>
  )
}
