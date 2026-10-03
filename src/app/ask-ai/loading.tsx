import * as React from 'react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

// Mirrors src/app/ask-ai/page.tsx + AIChatInterface (empty state)

// Desktop pills: text widths from the real page (wraps 2 / 1 / 1 / 2 inside max-w-xl)
const PILLS = ['w-[184px]', 'w-[227px]', 'w-[245px]', 'w-[265px]', 'w-[226px]', 'w-[231px]']

// Mobile cards: title (text-xs) + truncated prompt (text-[10px])
const MOBILE_CARDS = [
  { title: 'w-[95px]', prompt: 'w-full' },
  { title: 'w-[105px]', prompt: 'w-[92%]' },
  { title: 'w-[110px]', prompt: 'w-full' },
  { title: 'w-[105px]', prompt: 'w-[88%]' },
  { title: 'w-[70px]', prompt: 'w-full' },
  { title: 'w-[70px]', prompt: 'w-full' },
]

export default function AskAILoading() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-0.5 sm:space-y-1">
          <SkeletonText size="2xl" lineClassName="md:h-10" className="w-[75px] md:w-[113px] md:h-7" />
          <div className="hidden sm:block">
            <SkeletonText size="sm" className="sm:w-[400px] md:w-[500px] xl:w-[566px]" />
            <SkeletonText size="sm" lineClassName="xl:hidden" className="sm:w-40 md:w-16" />
          </div>
        </div>

        {/* AI Assistant Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-xs shrink-0">
          <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0" />
          <div>
            <SkeletonText size="xs" lineClassName="h-[15px] sm:h-[17.5px]" className="w-[60px] sm:w-[68px] sm:h-3" />
            <div className="flex items-center gap-1 mt-0.5 h-3">
              <Skeleton className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" />
              <Skeleton className="h-2 w-[72px] sm:w-[78px] rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="w-full flex flex-col">
        <div className="flex flex-col h-[75vh] sm:h-[78vh] lg:h-[80vh] w-full border border-slate-200/80 dark:border-white/25 rounded-2xl sm:rounded-3xl bg-card/30 dark:bg-slate-900/40 backdrop-blur-sm p-2.5 sm:p-4 shadow-sm overflow-hidden shimmer-card">
          {/* Toolbar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/20 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <SkeletonText size="2xs" lineClassName="sm:h-[16.5px]" className="w-32 sm:w-[148px]" />
            </div>
          </div>

          {/* Messages area (empty state) */}
          <div className="flex-1 overflow-hidden pr-1 sm:pr-2 min-h-0 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 sm:px-4">
              <div className="my-auto flex flex-col items-center w-full max-w-xl">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl mb-2.5 sm:mb-4 shrink-0" />

                <SkeletonText
                  size="sm"
                  lineClassName="sm:h-7 mb-1 sm:mb-6 shrink-0"
                  className="w-[227px] sm:w-[292px] md:w-[324px] sm:h-4 md:h-4.5"
                />
                {/* text-[11px] → 16.5px line, 2 lines on mobile */}
                <div className="mb-3 max-w-sm sm:hidden shrink-0 flex flex-col items-center">
                  <Skeleton className="h-2 w-[260px] max-w-full my-[4.25px] rounded-md" />
                  <Skeleton className="h-2 w-[120px] my-[4.25px] rounded-md" />
                </div>

                {/* Mobile: 1-column cards */}
                <div className="flex flex-col gap-2 w-full sm:hidden text-left">
                  {MOBILE_CARDS.map((c, i) => (
                    <div
                      key={i}
                      className="w-full p-2.5 rounded-2xl glass-card border border-slate-200/70 dark:border-white/25 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Skeleton className="w-8 h-[34px] rounded-xl shrink-0" />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <SkeletonText size="xs" lineClassName="h-[15px]" className={c.title} />
                          <SkeletonText size="2xs" lineClassName="h-[13.75px]" className={c.prompt} />
                        </div>
                      </div>
                      <Skeleton className="w-3.5 h-3.5 rounded-sm shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Desktop: wrapped pills (px-4 py-2 text-xs + border → 34px) */}
                <div className="hidden sm:flex sm:flex-wrap justify-center gap-2.5 w-full max-w-2xl shrink-0 px-1">
                  {PILLS.map((w, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 rounded-xl bg-slate-200/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/25"
                    >
                      <SkeletonText size="xs" className={w} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="pt-2 sm:pt-3 border-t border-slate-200/60 dark:border-white/20 mt-1 shrink-0">
            <div className="relative">
              <div className="flex items-end gap-1.5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl glass-panel border border-slate-200/70 dark:border-white/25">
                {/* textarea rows=1, leading-normal: 18px / 21px + py */}
                <div className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2">
                  <SkeletonText
                    size="xs"
                    lineClassName="h-[18px] sm:h-[21px]"
                    className="w-[160px] sm:w-[188px] sm:h-3"
                  />
                </div>
                <Skeleton className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl" />
              </div>
              {/* Footnote: text-[8.5px] / text-[10px] */}
              <SkeletonText
                size="2xs"
                lineClassName="h-[12.75px] sm:h-[15px] justify-center mt-1"
                className="w-[300px] max-w-full sm:w-[424px] h-1.5 sm:h-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
