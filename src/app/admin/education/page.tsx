import * as React from 'react'
import { EducationCrud } from '@/components/admin/education-crud'
import { getEducation } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminEducationPage() {
  const education = await getEducation()

  return (
    <div className="w-full">
      <EducationCrud initialEducation={education} />
    </div>
  )
}
