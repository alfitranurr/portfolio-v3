import { getProjects } from '@/lib/data-service'
import { ProjectsFilterList } from '@/components/projects-filter-list'

export const metadata = {
  title: 'Projects',
  description: 'Detailed showcase of Data Science, Artificial Intelligence, Analytics, and Software Engineering projects.',
}

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Projects Portfolio</h1>
        <p className="text-sm text-muted-foreground">Detailed catalog of data products, analytics, and applications</p>
      </div>

      {/* Main Filterable Projects list */}
      <ProjectsFilterList initialProjects={projects} />
    </div>
  )
}
