import { getExperience } from '@/lib/data-service'
import { ExperienceFilterList } from '@/components/experience-filter-list'

export const metadata = {
  title: 'Experience',
  description: 'Professional career timeline, internships, and roles.',
}

export const dynamic = 'force-dynamic'

export default async function ExperiencePage() {
  const experiences = await getExperience()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Experience</h1>
        <p className="text-sm text-muted-foreground">My career trajectory, internships, and leadership roles</p>
      </div>

      <ExperienceFilterList initialExperience={experiences} />
    </div>
  )
}
