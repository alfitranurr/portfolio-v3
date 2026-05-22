import * as React from 'react'
import { ExperienceCrud } from '@/components/admin/experience-crud'
import { getExperience } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminExperiencePage() {
  const experience = await getExperience()

  return (
    <div className="w-full">
      <ExperienceCrud initialExperience={experience} />
    </div>
  )
}
