import * as React from 'react'
import {
  AdminPageHeaderSkeleton,
  AdminControlsPanelSkeleton,
  SearchSortRowSkeleton,
  ControlsFooterSkeleton,
  AdminTableSkeleton,
  TableIndexCell,
  TableThumbCell,
  TableTextCell,
  TablePeriodCell,
  TableActionsCell,
} from '@/components/admin/shared/AdminPageSkeleton'

// Default: view tabel, 10 per halaman (4 entri → tanpa pagination)
const COLUMNS = [
  { className: 'py-2.5 px-3 w-10 text-center', width: 'w-1.5' },
  { className: 'py-2.5 px-3 min-w-[200px]', width: 'w-[62px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[28px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[39px]' },
  { className: 'py-2.5 px-3 whitespace-nowrap text-center', width: 'w-[22px]' },
  { className: 'py-2.5 px-3 text-center whitespace-nowrap w-36', width: 'w-[49px]' },
]

const ROWS = [
  { title: 'w-[186px]', subtitle: 'w-[190px]', field: 'w-[218px]', gpa: 'w-[53px]' },
  { title: 'w-[73px]', subtitle: 'w-[72px]', field: 'w-[93px]', gpa: 'w-[54px]' },
  { title: 'w-[115px]', subtitle: 'w-[204px]', field: 'w-[93px]', gpa: 'w-[47px]' },
  { title: 'w-[93px]', subtitle: 'w-[158px]', field: 'w-[93px]', gpa: 'w-[38px]' },
]

export default function AdminEducationLoading() {
  return (
    <div className="space-y-8 w-full">
      <AdminPageHeaderSkeleton
        titleWidth="w-[214px] sm:w-[267px]"
        subtitleWidth="w-full sm:w-[614px]"
        subtitleWrapWidth="w-3/5"
        buttonWidth="w-[145px]"
      />

      <div className="space-y-4">
        <AdminControlsPanelSkeleton>
          <SearchSortRowSkeleton placeholderWidth="w-[225px]" activeView="table" />
          <ControlsFooterSkeleton counterWidth="w-[147px]" />
        </AdminControlsPanelSkeleton>

        <AdminTableSkeleton columns={COLUMNS}>
          {ROWS.map((row, i) => (
            <tr key={i}>
              <TableIndexCell />
              <TableThumbCell titleWidth={row.title} subtitleWidth={row.subtitle} />
              <TableTextCell width={row.field} />
              <TablePeriodCell />
              <TableTextCell width={row.gpa} />
              <TableActionsCell />
            </tr>
          ))}
        </AdminTableSkeleton>
      </div>
    </div>
  )
}
