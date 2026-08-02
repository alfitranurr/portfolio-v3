'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SortOption {
  label: string
  value: string
}

interface CustomSortDropdownProps {
  value: string
  onChange: (val: any) => void
  options: SortOption[]
  className?: string
}

export function CustomSortDropdown({
  value,
  onChange,
  options,
  className
}: CustomSortDropdownProps) {
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

  return (
    <div className={cn("relative inline-block text-left transition-all", open ? "z-[9999]" : "z-20", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-xs font-bold text-foreground hover:bg-white/10 transition-all cursor-pointer shadow-xs"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/70" />
        <span className="text-muted-foreground font-medium hidden sm:inline">Sort:</span>
        <span className="font-extrabold text-foreground">{selectedLabel}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-700/60 dark:border-slate-800 shadow-2xl p-1.5 z-[9999]"
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
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-slate-200 hover:bg-white/10 hover:text-white"
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
