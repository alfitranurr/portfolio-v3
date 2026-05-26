'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Skill } from '@/lib/types'
import { Terminal } from 'lucide-react'
import {
  PythonIcon,
  SqlIcon,
  RIcon,
  ExcelIcon,
  TableauIcon,
  PowerBiIcon,
  NextjsIcon,
  SupabaseIcon,
  GitIcon,
  ScikitLearnIcon,
  TensorflowIcon,
  PytorchIcon
} from '@/components/icons'

function getSkillIcon(name: string, customPath: string | null, className?: string) {
  if (customPath) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d={customPath} />
      </svg>
    )
  }
  switch (name.toLowerCase()) {
    case 'python':
      return <PythonIcon className={className} />
    case 'sql':
      return <SqlIcon className={className} />
    case 'r':
      return <RIcon className={className} />
    case 'excel':
      return <ExcelIcon className={className} />
    case 'tableau':
      return <TableauIcon className={className} />
    case 'powerbi':
    case 'power bi':
      return <PowerBiIcon className={className} />
    case 'next.js':
    case 'nextjs':
      return <NextjsIcon className={className} />
    case 'supabase':
      return <SupabaseIcon className={className} />
    case 'git':
      return <GitIcon className={className} />
    case 'scikit-learn':
    case 'scikitlearn':
      return <ScikitLearnIcon className={className} />
    case 'tensorflow':
      return <TensorflowIcon className={className} />
    case 'pytorch':
      return <PytorchIcon className={className} />
    default:
      return <Terminal className={className} />
  }
}

interface SkillsGridProps {
  initialSkills: Skill[]
}

export function SkillsGrid({ initialSkills }: SkillsGridProps) {
  const [activeCategory, setActiveCategory] = React.useState('All')
  
  const categories = ['All', ...Array.from(new Set(initialSkills.map(s => s.category)))]

  const filteredSkills = activeCategory === 'All' 
    ? initialSkills 
    : initialSkills.filter(s => s.category === activeCategory)

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
            key={skill.id || skill.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="group p-5 rounded-2xl glass-card border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/20 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            <div>
              <div className="flex gap-4 items-start mb-3">
                <div className="shrink-0 p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 flex items-center justify-center w-11 h-11 group-hover:scale-105 group-hover:border-primary/20 transition-all duration-300">
                  {getSkillIcon(skill.name, skill.svg_path, "w-6 h-6")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-foreground text-sm md:text-base truncate group-hover:text-primary transition-colors">{skill.name}</h4>
                    <span className="shrink-0 text-[9px] uppercase font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {skill.desc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


