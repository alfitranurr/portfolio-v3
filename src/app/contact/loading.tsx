import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

// Mirrors src/app/contact/page.tsx (+ ContactForm)

// Social cards: name (text-xs) + @username (text-[10px] mono), widths from the real page
const SOCIALS = [
  { name: 'w-[35px]', user: 'w-[132px]' },
  { name: 'w-[52px]', user: 'w-[138px]' },
  { name: 'w-[66px]', user: 'w-[66px]' },
  { name: 'w-[43px]', user: 'w-[72px]' },
]

const INPUT = 'w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/25'

// Label is inline → sits in a 24px line box (no space-y margin)
function Label({ width }: { width: string }) {
  return (
    <div className="h-6 flex items-center">
      <SkeletonText size="xs" className={width} />
    </div>
  )
}

function Input({ placeholder }: { placeholder: string }) {
  return (
    <div className={INPUT}>
      <SkeletonText size="sm" className={placeholder} />
    </div>
  )
}

export default function ContactLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <SkeletonText size="2xl" lineClassName="md:h-10" className="w-[147px] md:w-[220px] md:h-7" />
        <div>
          <SkeletonText size="sm" className="w-full sm:w-[395px]" />
          <SkeletonText size="sm" lineClassName="sm:hidden" className="w-16" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Social Connections */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 shimmer-card">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-md shrink-0" />
              <SkeletonText size="lg" className="w-[162px]" />
            </div>
            {/* text-xs leading-relaxed: 2 lines mobile, 1 line md, 3 lines lg */}
            <div>
              <SkeletonText size="xs" lineClassName="h-[19.5px]" className="w-full" />
              <SkeletonText size="xs" lineClassName="h-[19.5px] md:hidden lg:flex" className="w-3/5 lg:w-full" />
              <SkeletonText size="xs" lineClassName="h-[19.5px] hidden lg:flex" className="w-[144px]" />
            </div>

            <div className="space-y-3 pt-2">
              {SOCIALS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3 rounded-2xl glass-card border border-slate-200/10 dark:border-slate-800/10"
                >
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex flex-col">
                    <SkeletonText size="xs" className={s.name} />
                    <SkeletonText size="2xs" className={s.user} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-2">
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4 shimmer-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                <SkeletonText size="lg" className="w-[210px]" />
              </div>
              <div>
                <SkeletonText size="xs" className="w-full md:w-[407px]" />
                <SkeletonText size="xs" lineClassName="md:hidden" className="w-24" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label width="w-[86px]" />
                  <Input placeholder="w-[105px]" />
                </div>
                <div>
                  <Label width="w-[111px]" />
                  <Input placeholder="w-[207px] max-w-full" />
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label width="w-[58px]" />
                <Input placeholder="w-[147px]" />
              </div>

              {/* Message: textarea rows=5 → 5×20 + py-3 + border = 126px, inline-block so it keeps the strut gap below */}
              <div>
                <Label width="w-[135px]" />
                <div className={`${INPUT} inline-block align-baseline overflow-hidden h-[126px]`}>
                  <SkeletonText size="sm" className="w-[302px] max-w-full" />
                </div>
              </div>

              {/* Submit: py-3 + text-sm → 44px */}
              <Skeleton className="w-full h-11 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
