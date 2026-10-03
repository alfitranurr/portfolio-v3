import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

// Mirrors src/app/experience/page.tsx + ExperienceFilterList (tab "Professional Experience")

interface Meta {
  current?: boolean
  date: string
  location?: string
}

interface SingleCard extends Meta {
  type: 'single'
  /** Role title bar width (mobile line 1 + md) */
  role: string
  /** Mobile-only second line of the role title */
  roleWrap?: string
  company: string
  companyWrap?: string
  toggle: boolean
}

interface GroupCard extends Meta {
  type: 'group'
  company: string
  companyWrap?: string
  roles: { role: string; date: string }[]
}

// Bar widths taken from the real page (1440px), mobile wraps from 412px
const CARDS: (SingleCard | GroupCard)[] = [
  {
    type: 'single', current: true, role: 'w-[190px] md:w-[283px]', roleWrap: 'w-16', company: 'w-[92px]',
    date: 'w-[161px]', location: 'w-[160px]', toggle: false,
  },
  {
    type: 'single', role: 'w-[142px] md:w-[158px]', company: 'w-[238px] md:w-[349px]', companyWrap: 'w-[102px]',
    date: 'w-[166px]', location: 'w-[175px]', toggle: true,
  },
  {
    type: 'group', company: 'w-[230px] md:w-[388px]', companyWrap: 'w-20', date: 'w-[165px]', location: 'w-[175px]',
    roles: [
      { role: 'w-[262px] md:w-[295px]', date: 'w-[165px]' },
      { role: 'w-[137px] md:w-[154px]', date: 'w-[165px]' },
    ],
  },
  {
    type: 'single', role: 'w-[230px] md:w-[255px]', company: 'w-[165px]',
    date: 'w-[161px]', location: 'w-[169px]', toggle: true,
  },
  {
    type: 'single', role: 'w-[220px] md:w-[244px]', company: 'w-[197px]',
    date: 'w-[170px]', location: 'w-[175px]', toggle: true,
  },
  {
    type: 'single', role: 'w-[180px] md:w-[199px]', company: 'w-[222px] md:w-[317px]', companyWrap: 'w-[90px]',
    date: 'w-[183px]', location: 'w-[175px]', toggle: true,
  },
]

function MetaRow({ width }: { width: string }) {
  return (
    <span className="flex items-center gap-1.5 md:flex-row-reverse">
      <Skeleton className="w-3.5 h-3.5 rounded-sm shrink-0" />
      <SkeletonText size="xs" className={width} />
    </span>
  )
}

// "Current" pill: px-2 py-0.5 text-[10px] + border → 21px tall
function CurrentBadge() {
  return <Skeleton className="h-[21px] w-[58px] rounded-md md:mb-0.5 self-start md:self-auto" />
}

function MetaColumn({ current, date, location }: Meta) {
  return (
    <div className="flex flex-col md:items-end gap-1.5 text-xs self-start md:self-auto shrink-0 md:text-right md:min-w-[210px]">
      {current && <CurrentBadge />}
      <MetaRow width={date} />
      {location && <MetaRow width={location} />}
    </div>
  )
}

// "Show Responsibilities" inline-flex button inside a 24px line box
function Toggle() {
  return (
    <div className="flex items-center gap-1.5 h-6">
      <SkeletonText size="xs" className="w-[133px]" />
      <Skeleton className="w-3.5 h-3.5 rounded-sm" />
    </div>
  )
}

function Logo() {
  return <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0" />
}

function SingleRoleCard({ card }: { card: SingleCard }) {
  return (
    <div className="w-full p-6 md:p-8 rounded-3xl glass-panel space-y-4 relative overflow-hidden shimmer-card">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex gap-4 items-start min-w-0 flex-1">
          <Logo />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-lg md:text-xl">
              <Skeleton className="w-5 h-5 rounded-md shrink-0" />
              <div className="min-w-0">
                <SkeletonText size="lg" className={`${card.role} md:h-4.5`} />
                {card.roleWrap && <SkeletonText size="lg" lineClassName="md:hidden" className={card.roleWrap} />}
              </div>
            </div>
            <div>
              <SkeletonText size="base" className={card.company} />
              {card.companyWrap && <SkeletonText size="base" lineClassName="md:hidden" className={card.companyWrap} />}
            </div>
          </div>
        </div>
        <MetaColumn current={card.current} date={card.date} location={card.location} />
      </div>

      {card.toggle && (
        <div className="pt-2">
          <Toggle />
        </div>
      )}
    </div>
  )
}

function MultiRoleCard({ card }: { card: GroupCard }) {
  return (
    <div className="w-full p-6 md:p-8 rounded-3xl glass-panel space-y-6 relative overflow-hidden shimmer-card">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
        <div className="flex gap-4 items-start min-w-0 flex-1">
          <Logo />
          <div className="space-y-1 min-w-0 flex-1">
            <div>
              <SkeletonText size="xl" lineClassName="md:h-8" className={`${card.company} md:h-5`} />
              {card.companyWrap && <SkeletonText size="xl" lineClassName="md:hidden" className={card.companyWrap} />}
            </div>
          </div>
        </div>
        <MetaColumn current={card.current} date={card.date} location={card.location} />
      </div>

      <div className="space-y-8 py-2">
        {card.roles.map((r, i) => (
          <div key={i} className="relative">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
                    <SkeletonText size="base" lineClassName="md:h-7" className={`${r.role} md:h-4`} />
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-1 text-xs self-start md:self-auto shrink-0 md:text-right md:min-w-[210px]">
                  <MetaRow width={r.date} />
                </div>
              </div>
              <div className="pt-1">
                <Toggle />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExperienceLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <SkeletonText size="2xl" lineClassName="md:h-10" className="w-[135px] md:w-[202px] md:h-7" />
        <SkeletonText size="sm" className="w-[374px] max-w-full" />
      </div>

      <div className="space-y-6 w-full">
        {/* Category Tabs (Professional active) */}
        <div className="flex justify-center px-2">
          <div className="flex p-1 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 max-w-lg w-full relative">
            <Skeleton className="flex-1 py-2 sm:py-2.5 rounded-xl flex items-center justify-center">
              <div className="h-[15px] sm:h-4 md:h-5" />
            </Skeleton>
            <div className="flex-1 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5">
              <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm shrink-0" />
              <SkeletonText
                size="2xs"
                lineClassName="sm:h-4 md:h-5"
                className="w-[62px] sm:w-[167px] md:w-[195px] sm:h-2.5 md:h-3"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="w-full py-2">
          <div className="space-y-6 w-full">
            {CARDS.map((card, i) => (
              <div key={i} className="w-full relative transform-gpu">
                {card.type === 'single' ? <SingleRoleCard card={card} /> : <MultiRoleCard card={card} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
