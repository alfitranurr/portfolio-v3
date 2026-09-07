'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function InitialLoader() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const hasLoaded = sessionStorage.getItem('has_loaded_intro')
    if (hasLoaded) {
      setTimeout(() => setLoading(false), 0)
      return
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('has_loaded_intro', 'true')
      setLoading(false)
    }, 2200)

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
            scale: 1.04,
            filter: "blur(20px)",
            transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Ambient center backlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[320px] h-[320px] md:w-[550px] md:h-[550px] rounded-full bg-gradient-to-tr from-neutral-200/30 via-neutral-300/25 to-neutral-400/20 filter blur-[100px] md:blur-[160px] pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center space-y-8 md:space-y-10 z-10 w-full px-4 text-center"
          >
            {/* Smooth Dual Spinning Ring */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center shrink-0">
              {/* Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full rounded-full border-[3px] border-neutral-200 border-t-neutral-900 border-r-neutral-500 shadow-[0_0_40px_rgba(0,0,0,0.08)]"
              />

              {/* Inner Reverse Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-3/4 h-3/4 rounded-full border-[2.5px] border-transparent border-b-neutral-900/70 border-l-neutral-400/60"
              />

              {/* Soft Pulsing Core */}
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-2/5 h-2/5 rounded-full bg-gradient-to-tr from-neutral-800/30 to-neutral-500/30 filter blur-sm"
              />
            </div>

            {/* Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 px-4 max-w-4xl"
            >
              <h1 className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] text-neutral-900 font-mono whitespace-nowrap">
                Al Fitra Nur Ramadhani
              </h1>
              <p className="text-[10px] sm:text-sm md:text-base text-neutral-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-extrabold whitespace-nowrap">
                Data Science Portfolio
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
