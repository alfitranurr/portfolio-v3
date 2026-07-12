import { getEducation } from '@/lib/data-service'
import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react'
import { SafeSchoolLogo } from '@/components/safe-school-logo'
import { CollapsibleEducationDescription } from '@/components/collapsible-education-description'
import { formatDuration } from '@/lib/utils'

export const metadata = {
  title: 'Education',
  description: 'Academic background, credentials, and achievements.',
}

export const revalidate = 3600

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
      <div className="space-y-6 py-2">
        {education.map((edu) => (
          <div key={edu.id} className="relative group">


            {/* Glassmorphic Event Card */}
            <div className="p-6 md:p-8 rounded-3xl glass-panel hover:border-primary/20 transition-all duration-300 space-y-4 relative overflow-hidden">
              {/* Subtle left indicator bar */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/40 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex gap-4 items-start">
                  {edu.logo_url && (
                    <SafeSchoolLogo src={edu.logo_url} alt={edu.institution} />
                  )}
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
                </div>

                {/* Metadata row */}
                <div className="flex flex-col md:items-end gap-1.5 text-xs text-muted-foreground self-start md:self-auto shrink-0 md:text-right font-medium">
                  <span className="flex items-center gap-1.5 md:flex-row-reverse">
                    <Calendar className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                    <span>
                      {new Date(edu.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {' - '}
                      {edu.end_date 
                        ? new Date(edu.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                        : 'Present'}
                      {` · ${formatDuration(edu.start_date, edu.end_date, !edu.end_date)}`}
                    </span>
                  </span>
                  {edu.location && (
                    <span className="flex items-center gap-1.5 md:flex-row-reverse">
                      <MapPin className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                      <span>{edu.location}</span>
                    </span>
                  )}
                  {edu.gpa && (
                    <div className="inline-flex items-center gap-1 text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 mt-1 md:mt-2">
                      <Award className="w-3.5 h-3.5" />
                      <span>GPA: {edu.gpa}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {edu.description && (
                <CollapsibleEducationDescription description={edu.description} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
