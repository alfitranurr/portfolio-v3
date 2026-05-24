'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function InitialLoader() {
  const [loading, setLoading] = React.useState(true)
  const [percent, setPercent] = React.useState(0)

  React.useEffect(() => {
    // Check if intro has already run in this session
    const hasLoaded = sessionStorage.getItem('has_loaded_intro')
    if (hasLoaded) {
      setLoading(false)
      return
    }

    const duration = 1600 // 1.6 seconds loading
    const intervalTime = 20
    const steps = duration / intervalTime
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = Math.min(Math.round((step / steps) * 100), 100)
      setPercent(progress)

      if (step >= steps) {
        clearInterval(timer)
        sessionStorage.setItem('has_loaded_intro', 'true')
        setTimeout(() => {
          setLoading(false)
        }, 150)
      }
    }, intervalTime)

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ 
            opacity: 0,
            filter: "blur(40px)",
            transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
          }}
          className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Ambient center backlight */}
          <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-primary/10 filter blur-[80px] md:blur-[120px] pointer-events-none animate-pulse" />

          <div className="flex flex-col items-center space-y-6 md:space-y-10 z-10 w-full px-4 text-center">
            {/* SVG drawing interlinked A-F monogram */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center shrink-0">
              <motion.svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Left leg of A */}
                <motion.path
                  d="M 50,15 L 20,80"
                  stroke="url(#gradient)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                {/* Right leg of A */}
                <motion.path
                  d="M 50,15 L 80,80"
                  stroke="url(#gradient)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                {/* Horizontal bar of A */}
                <motion.path
                  d="M 32,55 L 68,55"
                  stroke="url(#gradient)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
                />
                {/* Vertical line of F */}
                <motion.path
                  d="M 60,35 L 60,80"
                  stroke="url(#gradient)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
                />
                {/* Top horizontal bar of F */}
                <motion.path
                  d="M 60,35 L 78,35"
                  stroke="url(#gradient)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
                />
                {/* Middle horizontal bar of F */}
                <motion.path
                  d="M 60,55 L 74,55"
                  stroke="url(#gradient)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3 px-4 max-w-4xl">
              <h1 className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] text-foreground font-mono whitespace-nowrap">
                Al Fitra Nur Ramadhani
              </h1>
              <p className="text-[10px] sm:text-sm md:text-base text-muted-foreground/60 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-extrabold whitespace-nowrap">
                Data Science Portfolio
              </p>
            </div>

            {/* Progress counter */}
            <div className="text-base sm:text-lg md:text-2xl font-mono text-primary font-bold tracking-widest pt-2">
              {percent.toString().padStart(3, '0')}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
