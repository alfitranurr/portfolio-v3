'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SortOption<T extends string = string> {
  label: string
  value: T
}

interface CustomSortDropdownProps<T extends string = string> {
  value: T
  onChange: (val: T) => void
  options: SortOption<T>[]
  className?: string
  align?: 'left' | 'right' | 'auto'
}

export function CustomSortDropdown<T extends string = string>({
  value,
  onChange,
  options,
  className,
  align = 'auto'
}: CustomSortDropdownProps<T>) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)
  const selectedLabel = selectedOption?.label || value

  const alignmentClass = 
    align === 'left' 
      ? 'left-0' 
      : align === 'right' 
        ? 'right-0' 
        : 'left-0 sm:left-auto sm:right-0'

  return (
    <div className={cn("relative inline-block text-left transition-all", open ? "z-[9999]" : "z-20", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-xs font-bold text-foreground hover:bg-white/10 transition-all cursor-pointer shadow-xs whitespace-nowrap"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        <span className="text-muted-foreground font-medium hidden sm:inline">Sort:</span>
        <span className="font-extrabold text-foreground truncate max-w-[130px] sm:max-w-none">{selectedLabel}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute mt-1.5 min-w-[11.5rem] w-max max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-[9999]",
              alignmentClass
            )}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
