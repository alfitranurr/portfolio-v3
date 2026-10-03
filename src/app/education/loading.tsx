import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

// Mirrors src/app/education/page.tsx (+ CollapsibleEducationDescription)

interface Card {
  /** Degree bar (mobile line 1 + md) and optional mobile-only wrap line */
  degree: string
  degreeWrap?: string
  institution: string
  institutionWrap?: string
  field: string
  fieldWrap?: string
  date: string
  location: string
  /** GPA text width (badge = px-2.5 + icon + gap + text) */
  gpa: string
  description: boolean
}

// Bar widths taken from the real page (1440px), mobile wraps from 412px
const CARDS: Card[] = [
  {
    degree: 'w-[200px] md:w-[310px]', degreeWrap: 'w-[70px]',
    institution: 'w-[245px] md:w-[307px]', institutionWrap: 'w-[60px]',
    field: 'w-[240px] md:w-[275px]', fieldWrap: 'w-[50px]',
    date: 'w-[200px]', location: 'w-[175px]', gpa: 'w-[92px]', description: true,
  },
  {
    degree: 'w-[109px] md:w-[121px]', institution: 'w-[116px]', field: 'w-[138px]',
    date: 'w-[152px]', location: 'w-[229px]', gpa: 'w-[92px]', description: true,
  },
  {
    degree: 'w-[172px] md:w-[191px]',
    institution: 'w-[185px] md:w-[328px]', institutionWrap: 'w-[135px]',
    field: 'w-[138px]', date: 'w-[188px]', location: 'w-[188px]', gpa: 'w-[84px]', description: false,
  },
  {
    degree: 'w-[140px] md:w-[155px]', institution: 'w-[254px]', field: 'w-[138px]',
    date: 'w-[195px]', location: 'w-[188px]', gpa: 'w-[72px]', description: false,
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

function EducationCard({ card }: { card: Card }) {
  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel space-y-4 relative overflow-hidden shimmer-card">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex gap-4 items-start">
          <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-lg md:text-xl">
              <Skeleton className="w-5 h-5 rounded-md shrink-0" />
              <div>
                <SkeletonText size="lg" className={`${card.degree} md:h-4.5`} />
                {card.degreeWrap && <SkeletonText size="lg" lineClassName="md:hidden" className={card.degreeWrap} />}
              </div>
            </div>
            <div>
              <SkeletonText size="base" className={card.institution} />
              {card.institutionWrap && (
                <SkeletonText size="base" lineClassName="md:hidden" className={card.institutionWrap} />
              )}
            </div>
            <div>
              <SkeletonText size="xs" className={card.field} />
              {card.fieldWrap && <SkeletonText size="xs" lineClassName="md:hidden" className={card.fieldWrap} />}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-col md:items-end gap-1.5 text-xs self-start md:self-auto shrink-0 md:text-right">
          <MetaRow width={card.date} />
          <MetaRow width={card.location} />
          {/* GPA badge */}
          <div className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-white/15 mt-1 md:mt-2">
            <Skeleton className="w-3.5 h-3.5 rounded-sm shrink-0" />
            <SkeletonText size="xs" className={card.gpa} />
          </div>
        </div>
      </div>

      {/* Collapsed description: border-t + "Show Details" + empty grid row (space-y-2) */}
      {card.description && (
        <div className="pt-3 border-t border-slate-200/10 dark:border-slate-800/10 space-y-2">
          <div className="flex items-center gap-1">
            <SkeletonText size="xs" className="w-[78px]" />
            <Skeleton className="w-3.5 h-3.5 rounded-sm" />
          </div>
          <div />
        </div>
      )}
    </div>
  )
}

export default function EducationLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <SkeletonText size="2xl" lineClassName="md:h-10" className="w-[229px] md:w-[343px] md:h-7" />
        <SkeletonText size="sm" className="w-[376px] max-w-full" />
      </div>

      {/* Timeline */}
      <div className="space-y-6 py-2">
        {CARDS.map((card, i) => (
          <div key={i} className="relative">
            <EducationCard card={card} />
          </div>
        ))}
      </div>
    </div>
  )
}
