import * as React from 'react'
import { ProjectsCrud } from '@/components/admin/projects'
import { getProjects } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="w-full">
      <ProjectsCrud initialProjects={projects} />
    </div>
  )
}
