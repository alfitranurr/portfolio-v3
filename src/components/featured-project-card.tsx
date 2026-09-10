'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { BlurImage } from '@/components/ui/blur-image'
import { getSubCategoryColor, cn } from '@/lib/utils'
import { Project } from '@/lib/types'

interface FeaturedProjectCardProps {
  project: Project
  index: number
}

export function FeaturedProjectCard({ project, index }: FeaturedProjectCardProps) {
  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }
      }}
      className="group p-6 rounded-3xl glass-panel hover:border-primary/20 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
    >
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      <div className="space-y-4">
        {/* Thumbnail container */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200/10 to-slate-200/5 dark:from-slate-800/10 dark:to-slate-800/5 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center">
          {project.cover_image ? (
            <>
              {/* Ambient blur background */}
              <BlurImage
                src={project.cover_image}
                alt=""
                lowQuality
                initialBlur="blur-xl opacity-0"
                initialScale="scale-110"
                loadedBlur="blur-xl opacity-30"
                loadedScale="scale-110"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-500 select-none pointer-events-none"
              />
              {/* Contained foreground image */}
              <BlurImage
                src={project.cover_image}
                alt={project.title}
                priority={index < 3}
                loading={index >= 3 ? "eager" : undefined}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-full object-contain relative z-10 group-hover:scale-103 transition-transform duration-500"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-neutral-300/10 to-neutral-500/10 flex flex-col items-center justify-center p-4">
              <span className="text-primary/25 group-hover:text-primary/50 group-hover:scale-110 transition-all font-black uppercase tracking-widest text-[9px] text-center leading-normal">
                {project.sub_category}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md", getSubCategoryColor(project.sub_category).badge)}>
              {project.sub_category}
            </span>
            {project.is_on_progress && (
              <span className="text-[9px] font-extrabold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shrink-0">
                On Progress
              </span>
            )}
          </div>
          <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {project.description}
          </p>
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10 mt-4">
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 text-xs font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>Explore Writeup</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  )
}
