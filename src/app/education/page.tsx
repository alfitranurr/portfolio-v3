import { getEducation } from '@/lib/data-service'
import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react'

export const metadata = {
  title: 'Education',
  description: 'Academic background, credentials, and achievements.',
}

export default async function EducationPage() {
  const education = await getEducation()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Academic Journey</h1>
        <p className="text-sm text-muted-foreground">My academic background and structural foundations</p>
      </div>

      {/* Timeline Section */}
      <div className="relative border-l border-slate-200/20 dark:border-slate-800/20 ml-4 md:ml-6 pl-6 md:pl-8 space-y-10 py-2">
        {education.map((edu) => (
          <div key={edu.id} className="relative group">
            {/* Animated Timeline Indicator Dot */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary group-hover:scale-125 transition-all duration-300 z-10" />

            {/* Glassmorphic Event Card */}
            <div className="p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-all duration-300 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl">
                    <GraduationCap className="w-5 h-5 shrink-0" />
                    <h2>{edu.degree}</h2>
                  </div>
                  <h3 className="font-semibold text-foreground/90">{edu.institution}</h3>
                  {edu.field_of_study && (
                    <p className="text-xs text-muted-foreground font-semibold">
                      Field: {edu.field_of_study}
                    </p>
                  )}
                </div>

                {/* Metadata badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground self-start md:self-auto">
                  <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(edu.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {' - '}
                      {edu.end_date 
                        ? new Date(edu.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                        : 'Present'}
                    </span>
                  </span>
                  {edu.location && (
                    <span className="flex items-center gap-1 bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-2.5 py-1 rounded-lg font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{edu.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* GPA display */}
              {edu.gpa && (
                <div className="inline-flex items-center gap-1 text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                  <Award className="w-3.5 h-3.5" />
                  <span>GPA: {Number(edu.gpa).toFixed(2)}</span>
                </div>
              )}

              {/* Description */}
              {edu.description && (
                <p className="text-sm text-foreground/80 leading-relaxed pt-3 border-t border-slate-200/10 dark:border-slate-800/10">
                  {edu.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
