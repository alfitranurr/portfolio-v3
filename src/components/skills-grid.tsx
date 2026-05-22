'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TECH_STACK } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function SkillsGrid() {
  const [activeCategory, setActiveCategory] = React.useState('All')
  
  const categories = ['All', ...Array.from(new Set(TECH_STACK.map(s => s.category)))]

  const filteredSkills = activeCategory === 'All' 
    ? TECH_STACK 
    : TECH_STACK.filter(s => s.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer",
              activeCategory === cat
                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                : "bg-white/5 border-slate-200/10 dark:border-slate-800/10 hover:border-slate-200/20 text-foreground/80 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredSkills.map((skill, index) => (
          <motion.div
            layout
            key={skill.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="p-5 rounded-2xl glass-card border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-foreground text-sm md:text-base">{skill.name}</h4>
                <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                  {skill.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4 min-h-[32px] line-clamp-2">
                {skill.desc}
              </p>
            </div>
            
            {/* Proficiency Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-muted-foreground">Proficiency</span>
                <span className="text-foreground">{skill.level}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/20 dark:bg-slate-800/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
