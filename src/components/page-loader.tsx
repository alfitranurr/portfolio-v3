'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function PageLoader() {
  const pathname = usePathname()
  const [isDone, setIsDone] = React.useState(false)
  const [shouldShow, setShouldShow] = React.useState(false)

  React.useEffect(() => {
    // Avoid showing on admin pages
    if (pathname.startsWith('/admin')) {
      setShouldShow(false)
      setIsDone(true)
      return
    }

    // Use sessionStorage to only run once per session (tabs / page refresh)
    const hasLoaded = sessionStorage.getItem('portfolio_loaded')
    if (hasLoaded) {
      setShouldShow(false)
      setIsDone(true)
      return
    }

    setShouldShow(true)
  }, [pathname])

  React.useEffect(() => {
    if (!shouldShow || isDone) return

    // Prevent body scrolling during loading animation
    document.body.style.overflow = 'hidden'

    // Simulation: wait for 2.5 seconds to fully render and show page
    const timer = setTimeout(() => {
      setIsDone(true)
      sessionStorage.setItem('portfolio_loaded', 'true')
      document.body.style.overflow = ''
    }, 2500)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [shouldShow, isDone])

  if (!shouldShow || isDone) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0, 
          y: -100,
          scale: 1.05,
          transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
        }}
        className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 select-none"
        style={{
          // Notebook lined paper style background
          backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.08) 1px, transparent 1px)',
          backgroundSize: '100% 40px',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="flex flex-col items-center gap-6 relative z-10">
          {/* Animated SVG Mascot */}
          <svg viewBox="0 0 200 230" className="w-44 h-44 drop-shadow-[0_4px_10px_rgba(0,77,128,0.15)] overflow-visible">
            <style>{`
              @keyframes mascot-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-12px); }
              }
              @keyframes left-leg-swing {
                0%, 100% { transform: rotate(-12deg); }
                50% { transform: rotate(12deg); }
              }
              @keyframes right-leg-swing {
                0%, 100% { transform: rotate(12deg); }
                50% { transform: rotate(-12deg); }
              }
              @keyframes right-arm-wave {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(20deg); }
              }
              .mascot-group {
                animation: mascot-bounce 1.2s ease-in-out infinite;
              }
              .left-leg-g {
                animation: left-leg-swing 1.2s ease-in-out infinite;
                transform-origin: 88px 156px;
              }
              .right-leg-g {
                animation: right-leg-swing 1.2s ease-in-out infinite;
                transform-origin: 112px 156px;
              }
              .right-arm-path {
                animation: right-arm-wave 1.2s ease-in-out infinite;
                transform-origin: 135px 110px;
              }
            `}</style>
            
            <g className="mascot-group">
              {/* Left Arm */}
              <path
                d="M 64 110 C 53 125, 48 140, 50 156"
                fill="none"
                stroke="#004d80"
                strokeWidth="5.5"
                strokeLinecap="round"
              />

              {/* Right Arm */}
              <path
                className="right-arm-path"
                d="M 136 110 C 146 100, 156 90, 150 72"
                fill="none"
                stroke="#004d80"
                strokeWidth="5.5"
                strokeLinecap="round"
              />

              {/* Left Leg & Shoe */}
              <g className="left-leg-g">
                <path
                  d="M 88 156 C 88 178, 80 188, 84 202"
                  fill="none"
                  stroke="#004d80"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 84 202 C 80 202, 74 200, 74 206 C 74 210, 81 210, 88 208"
                  fill="none"
                  stroke="#004d80"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Right Leg & Shoe */}
              <g className="right-leg-g">
                <path
                  d="M 112 156 C 112 178, 120 188, 116 202"
                  fill="none"
                  stroke="#004d80"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 116 202 C 120 202, 126 200, 126 206 C 126 210, 119 210, 112 208"
                  fill="none"
                  stroke="#004d80"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Star Body */}
              <path
                d="M 100 35
                   C 108 35, 114 62, 126 68
                   C 138 74, 168 74, 168 86
                   C 168 98, 142 108, 137 120
                   C 132 132, 146 160, 136 166
                   C 126 172, 108 152, 100 152
                   C 92 152, 74 172, 64 166
                   C 54 160, 68 132, 63 120
                   C 58 108, 32 98, 32 86
                   C 32 74, 62 74, 74 68
                   C 86 62, 92 35, 100 35 Z"
                fill="#ffffff"
                stroke="#004d80"
                strokeWidth="5.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Shorts/Pants */}
              <path
                d="M 86 142
                   L 114 142
                   L 115 158
                   L 102 158
                   L 100 150
                   L 98 158
                   L 85 158
                   Z"
                fill="#004d80"
                stroke="#004d80"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Eyes */}
              <ellipse cx="88" cy="98" rx="3.5" ry="6" fill="#004d80" />
              <ellipse cx="112" cy="98" rx="3.5" ry="6" fill="#004d80" />

              {/* Smirking smile */}
              <path
                d="M 98 108 Q 103 113 106 106"
                fill="none"
                stroke="#004d80"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {/* Custom Bouncing "Loading .." Text */}
          <div className="flex items-center gap-1 text-[#004d80] font-sans font-black text-2xl tracking-wider pt-2">
            <span>Loading</span>
            <span className="animate-[mascot-bounce_0.8s_infinite_100ms] inline-block font-mono">.</span>
            <span className="animate-[mascot-bounce_0.8s_infinite_200ms] inline-block font-mono">.</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
