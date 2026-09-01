'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skill } from '@/lib/types'
import { Terminal } from 'lucide-react'
import {
  PythonIcon,
  SqlIcon,
  LookerIcon,
  ExcelIcon,
  TableauIcon,
  PowerBiIcon,
  NextjsIcon,
  SupabaseIcon,
  GitIcon,
  ScikitLearnIcon,
  TensorflowIcon,
  PytorchIcon,
  SqlServerIcon,
  SsisIcon,
  FigmaIcon,
  CanvaIcon,
  BigQueryIcon
} from '@/components/icons'

function getSkillIcon(name: string, customPath: string | null, className?: string, logoUrl?: string | null) {
  if (logoUrl) {
    return (
      <Image src={logoUrl} className={className} alt={name} width={24} height={24} unoptimized />
    )
  }
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
    case 'looker studio':
    case 'googledatastudio':
    case 'google data studio':
    case 'datastudio':
    case 'data studio':
      return <LookerIcon className={className} />
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
    case 'sql server':
    case 'microsoft sql server':
    case 'mssql':
      return <SqlServerIcon className={className} />
    case 'ssis':
    case 'sql server integration services':
      return <SsisIcon className={className} />
    case 'figma':
      return <FigmaIcon className={className} />
    case 'canva':
      return <CanvaIcon className={className} />
    case 'bigquery':
    case 'big query':
    case 'google bigquery':
      return <BigQueryIcon className={className} />
    default:
      return <Terminal className={className} />
  }
}

function getSkillColor(name: string) {
  switch (name.toLowerCase()) {
    case 'python':
      return 'text-[#3776AB]'
    case 'sql':
      return 'text-[#00758F] dark:text-[#00a3c4]'
    case 'looker studio':
    case 'googledatastudio':
    case 'google data studio':
    case 'datastudio':
    case 'data studio':
      return 'text-[#4285F4]'
    case 'excel':
      return 'text-[#107C41]'
    case 'tableau':
      return 'text-[#E97627]'
    case 'powerbi':
    case 'power bi':
      return 'text-[#F2C811]'
    case 'next.js':
    case 'nextjs':
      return 'text-black dark:text-white'
    case 'supabase':
      return 'text-[#3ECF8E]'
    case 'git':
      return 'text-[#F05032]'
    case 'scikit-learn':
    case 'scikitlearn':
      return 'text-[#F7931E]'
    case 'tensorflow':
      return 'text-[#FF6F00]'
    case 'pytorch':
      return 'text-[#EE4C2C]'
    case 'react':
    case 'react.js':
    case 'reactjs':
      return 'text-[#61DAFB]'
    case 'node.js':
    case 'nodejs':
    case 'node':
      return 'text-[#339933]'
    case 'tailwind':
    case 'tailwindcss':
      return 'text-[#06B6D4]'
    case 'javascript':
    case 'js':
      return 'text-[#F7DF1E]'
    case 'vite':
      return 'text-[#646CFF]'
    case 'prisma':
      return 'text-emerald-500 dark:text-emerald-400'
    case 'figma':
      return 'text-[#F24E1E]'
    case 'canva':
      return 'text-[#00C4CC]'
    case 'sql server':
    case 'microsoft sql server':
    case 'mssql':
      return 'text-[#CC292B]'
    case 'ssis':
    case 'sql server integration services':
      return 'text-[#0078D4]'
    case 'bigquery':
    case 'big query':
    case 'google bigquery':
      return 'text-[#4285F4]'
    case 'android':
      return 'text-[#3DDC84]'
    default:
      return 'text-slate-700 dark:text-slate-300'
  }
}

interface SkillsMarqueeProps {
  skills: Skill[]
}

export function SkillsMarquee({ skills }: SkillsMarqueeProps) {
  if (!skills || skills.length === 0) return null

  // Split skills into 3 rows
  const r1 = skills.filter((_, idx) => idx % 3 === 0)
  const r2 = skills.filter((_, idx) => idx % 3 === 1)
  const r3 = skills.filter((_, idx) => idx % 3 === 2)

  // Duplication logic to ensure there are enough items to fill the viewport width and prevent gaps
  const getRepeatedItems = (items: Skill[]) => {
    if (items.length === 0) return []
    const repeatCount = Math.max(2, Math.ceil(15 / items.length))
    const repeated: Skill[] = []
    for (let i = 0; i < repeatCount; i++) {
      repeated.push(...items)
    }
    return repeated
  }

  const row1 = getRepeatedItems(r1)
  const row2 = getRepeatedItems(r2)
  const row3 = getRepeatedItems(r3)

  const renderRow = (rowSkills: Skill[], isDuplicate: boolean) => {
    return rowSkills.map((skill, index) => {
      const uniqueKey = `${skill.id || skill.name}-${isDuplicate ? 'dup' : 'orig'}-${index}`
      const iconColorClass = getSkillColor(skill.name)
      return (
        <div
          key={uniqueKey}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card text-xs font-semibold text-foreground/90 shrink-0 hover:scale-105 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 shadow-sm"
        >
          <div className={cn("w-4.5 h-4.5 flex items-center justify-center shrink-0", iconColorClass)}>
            {getSkillIcon(skill.name, skill.svg_path, "w-4.5 h-4.5", skill.logo_url)}
          </div>
          <span>{skill.name}</span>
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col gap-3 py-4 overflow-hidden relative w-full">
      {/* Row 1: Right to Left */}
      {row1.length > 0 && (
        <div className="marquee-container w-full">
          <div 
            className="flex gap-4 animate-marquee-left" 
            style={{ '--marquee-duration': '80s' } as React.CSSProperties}
          >
            <div className="flex gap-4 shrink-0">
              {renderRow(row1, false)}
            </div>
            <div className="flex gap-4 shrink-0" aria-hidden="true">
              {renderRow(row1, true)}
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Left to Right */}
      {row2.length > 0 && (
        <div className="marquee-container w-full">
          <div 
            className="flex gap-4 animate-marquee-right" 
            style={{ '--marquee-duration': '95s' } as React.CSSProperties}
          >
            <div className="flex gap-4 shrink-0">
              {renderRow(row2, false)}
            </div>
            <div className="flex gap-4 shrink-0" aria-hidden="true">
              {renderRow(row2, true)}
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Right to Left */}
      {row3.length > 0 && (
        <div className="marquee-container w-full">
          <div 
            className="flex gap-4 animate-marquee-left" 
            style={{ '--marquee-duration': '88s' } as React.CSSProperties}
          >
            <div className="flex gap-4 shrink-0">
              {renderRow(row3, false)}
            </div>
            <div className="flex gap-4 shrink-0" aria-hidden="true">
              {renderRow(row3, true)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
