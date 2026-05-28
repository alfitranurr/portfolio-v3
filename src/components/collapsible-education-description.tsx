'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleEducationDescriptionProps {
  description: string
}

export function CollapsibleEducationDescription({ description }: CollapsibleEducationDescriptionProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="pt-3 border-t border-slate-200/10 dark:border-slate-800/10 space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer select-none"
      >
        <span>{isOpen ? 'Hide Details' : 'Show Details'}</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-sm text-foreground/80 leading-relaxed text-justify">
          {description}
        </p>
      </div>
    </div>
  )
}
