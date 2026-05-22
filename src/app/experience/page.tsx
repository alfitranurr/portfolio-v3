import { getExperience } from '@/lib/data-service'
import { Briefcase, Calendar, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Experience',
  description: 'Professional career timeline, internships, and roles.',
}

export default async function ExperiencePage() {
  const experiences = await getExperience()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Professional Experience</h1>
        <p className="text-sm text-muted-foreground">My career trajectory, internships, and leadership roles</p>
      </div>

      {/* Timeline Section */}
      <div className="relative border-l border-slate-200/20 dark:border-slate-800/20 ml-4 md:ml-6 pl-6 md:pl-8 space-y-10 py-2">
        {experiences.map((exp) => (
          <div key={exp.id} className="relative group">
            {/* Animated Timeline Indicator Dot */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary group-hover:scale-125 transition-all duration-300 z-10" />

            {/* Glassmorphic Event Card */}
            <div className="p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-all duration-300 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl">
                    <Briefcase className="w-5 h-5 shrink-0" />
                    <h2>{exp.role}</h2>
                  </div>
                  <h3 className="font-semibold text-foreground/90">{exp.company}</h3>
                </div>

                {/* Metadata badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground self-start md:self-auto">
                  {exp.is_current && (
                    <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg font-extrabold animate-pulse">
                      Current
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {' - '}
                      {exp.end_date 
                        ? new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                        : 'Present'}
                    </span>
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{exp.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Responsibilities list */}
              {exp.description && exp.description.length > 0 && (
                <ul className="space-y-2 pt-3 border-t border-slate-200/10 dark:border-slate-800/10 text-sm text-foreground/85 list-disc list-inside">
                  {exp.description.map((bullet, index) => (
                    <li key={index} className="leading-relaxed pl-1">
                      <span className="ml-1.5">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
