import * as React from 'react'
import { ProjectsCrud } from '@/components/admin/projects-crud'
import { getProjects } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await getProjects()

  // Format array to match components expects
  const formattedProjects = projects.map((p: any) => ({
    ...p,
    category: p.category as 'data' | 'non-data'
  }))

  return (
    <div className="w-full">
      <ProjectsCrud initialProjects={formattedProjects} />
    </div>
  )
}
