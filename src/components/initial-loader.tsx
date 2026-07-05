'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function InitialLoader() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Check if intro has already run in this session
    const hasLoaded = sessionStorage.getItem('has_loaded_intro')
    if (hasLoaded) {
      setTimeout(() => {
        setLoading(false)
      }, 0)
      return
    }

    // Play smooth loading intro
    const timer = setTimeout(() => {
      sessionStorage.setItem('has_loaded_intro', 'true')
      setLoading(false)
    }, 900)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.03,
            filter: "blur(16px)",
            transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Ambient center backlight */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[320px] h-[320px] md:w-[550px] md:h-[550px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-primary/20 to-purple-500/15 filter blur-[90px] md:blur-[140px] pointer-events-none" 
          />

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center space-y-6 md:space-y-8 z-10 w-full px-4 text-center"
          >
            {/* Ultra-Smooth Dual Spinning Ring */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center shrink-0">
              {/* Outer Glowing Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                className="w-full h-full rounded-full border-[3.5px] border-slate-800/60 border-t-cyan-400 border-r-purple-500 shadow-[0_0_35px_rgba(34,211,238,0.3)]"
              />

              {/* Inner Reverse Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                className="absolute w-3/4 h-3/4 rounded-full border-[2.5px] border-transparent border-b-cyan-300/80 border-l-primary/80"
              />

              {/* Soft Pulsing Core Glow */}
              <motion.div 
                animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-2/5 h-2/5 rounded-full bg-gradient-to-tr from-cyan-400/40 to-purple-500/40 filter blur-xs" 
              />
            </div>

            {/* Title & Subtitle */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3 px-4 max-w-4xl"
            >
              <h1 className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] text-foreground font-mono whitespace-nowrap">
                Al Fitra Nur Ramadhani
              </h1>
              <p className="text-[10px] sm:text-sm md:text-base text-muted-foreground/60 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-extrabold whitespace-nowrap">
                Data Science Portfolio
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
