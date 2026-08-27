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

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selectedOption = options.find(o => o.value === value)
  const selectedLabel = selectedOption?.label || value

  const alignmentClass = 
    align === 'left' 
      ? 'left-0' 
      : align === 'right' 
        ? 'right-0' 
        : 'left-0 sm:left-auto sm:right-0'

  const originClass =
    align === 'left'
      ? 'origin-top-left'
      : align === 'right'
        ? 'origin-top-right'
        : 'origin-top-left sm:origin-top-right'

  return (
    <div className={cn("relative inline-block text-left", open ? "z-[9999]" : "z-20", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs whitespace-nowrap active:scale-[0.98]",
          "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md",
          "border border-slate-300 dark:border-slate-700/60",
          "hover:bg-white dark:hover:bg-slate-800/80 hover:border-primary/40 hover:shadow-xs",
          open
            ? "border-primary/60 text-primary ring-2 ring-primary/15 shadow-xs"
            : "text-foreground"
        )}
      >
        <ArrowUpDown className={cn(
          "w-3.5 h-3.5 transition-colors duration-200 shrink-0",
          open ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        )} />
        <span className="text-muted-foreground font-medium text-xs">Sort:</span>
        <span className="font-bold text-foreground truncate max-w-[130px] sm:max-w-none text-xs">{selectedLabel}</span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ease-[0.16,1,0.3,1] shrink-0",
          open && "rotate-180 text-primary"
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute mt-1.5 min-w-[12rem] w-max max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-300/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-1.5 z-[9999]",
              alignmentClass,
              originClass
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
                    "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left whitespace-nowrap",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white active:scale-[0.99]"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                    </motion.span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
