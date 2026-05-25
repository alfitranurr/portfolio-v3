'use client'

import * as React from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = React.useState(false)

  // Show button when page is scrolled down
  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    // Run once on mount to handle pre-scrolled page loads
    toggleVisibility()

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={scrollToTop}
          type="button"
          aria-label="Scroll to top"
          className={cn(
            "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[99] cursor-pointer",
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md",
            "border border-slate-300 dark:border-slate-700/50 text-foreground",
            "shadow-lg shadow-slate-950/5 dark:shadow-black/20",
            "hover:bg-primary hover:text-primary-foreground hover:border-primary",
            "dark:hover:bg-primary dark:hover:text-primary-foreground dark:hover:border-primary",
            "hover:scale-110 active:scale-95 transition-all duration-300",
            "group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          )}
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
