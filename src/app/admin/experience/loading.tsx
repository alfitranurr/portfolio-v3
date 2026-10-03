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
  TablePeriodCell,
  TableActionsCell,
  PaginationSkeleton,
} from '@/components/admin/shared/AdminPageSkeleton'

// Default: kategori "All", view tabel, 10 per halaman
const COLUMNS = [
  { className: 'py-2.5 px-3 w-10 text-center', width: 'w-1.5' },
  { className: 'py-2.5 px-3 min-w-[200px]', width: 'w-[96px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[58px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[39px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[56px]' },
  { className: 'py-2.5 px-3 text-center whitespace-nowrap w-36', width: 'w-[49px]' },
]

const PRO = 'w-[81px]'
const ORG = 'w-[156px]'

const ROWS = [
  { title: 'w-[170px]', subtitle: 'w-[57px]', badge: PRO, end: 'w-[46px]', location: 'w-[147px]' },
  { title: 'w-[95px]', subtitle: 'w-[215px]', badge: PRO, end: 'w-[53px]', location: 'w-[161px]' },
  { title: 'w-[133px]', subtitle: 'w-[120px]', badge: ORG, end: 'w-[53px]', location: 'w-[161px]' },
  { title: 'w-[194px]', subtitle: 'w-[157px]', badge: PRO, end: 'w-[53px]', location: 'w-[161px]' },
  { title: 'w-[101px]', subtitle: 'w-[157px]', badge: PRO, end: 'w-[53px]', location: 'w-[161px]' },
  { title: 'w-[153px]', subtitle: 'w-[102px]', badge: PRO, end: 'w-[53px]', location: 'w-[155px]' },
  { title: 'w-[146px]', subtitle: 'w-[122px]', badge: PRO, end: 'w-[53px]', location: 'w-[161px]' },
  { title: 'w-[120px]', subtitle: 'w-[196px]', badge: PRO, end: 'w-[53px]', location: 'w-[161px]' },
  { title: 'w-[266px]', subtitle: 'w-[105px]', badge: ORG, end: 'w-[53px]', location: 'w-[161px]' },
  { title: 'w-[218px]', subtitle: 'w-[132px]', badge: ORG, end: 'w-[53px]', location: 'w-[161px]' },
]

export default function AdminExperienceLoading() {
  return (
    <div className="space-y-8 w-full">
      <AdminPageHeaderSkeleton
        titleWidth="w-[204px] sm:w-[255px]"
        subtitleWidth="w-full sm:w-[581px]"
        subtitleWrapWidth="w-1/2"
        buttonWidth="w-[150px]"
      />

      <div className="space-y-4">
        <AdminControlsPanelSkeleton>
          <CategoryTabsSkeleton
            className="max-w-2xl"
            tabs={[
              { width: 'w-[95px]' },
              { icon: true, width: 'w-[149px]' },
              { icon: true, width: 'w-[167px]' },
            ]}
          />
          <SearchSortRowSkeleton placeholderWidth="w-[227px]" activeView="table" />
          <ControlsFooterSkeleton counterWidth="w-[159px]" />
        </AdminControlsPanelSkeleton>

        <AdminTableSkeleton columns={COLUMNS}>
          {ROWS.map((row, i) => (
            <tr key={i}>
              <TableIndexCell wide={i >= 9} />
              <TableThumbCell titleWidth={row.title} subtitleWidth={row.subtitle} />
              <TableBadgeCell width={row.badge} />
              <TablePeriodCell endWidth={row.end} />
              <TableTextCell width={row.location} />
              <TableActionsCell />
            </tr>
          ))}
        </AdminTableSkeleton>

        <PaginationSkeleton pages={2} summaryWidth="w-[115px]" />
      </div>
    </div>
  )
}
