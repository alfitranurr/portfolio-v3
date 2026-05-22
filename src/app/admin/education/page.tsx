import * as React from 'react'
import { EducationCrud } from '@/components/admin/education-crud'
import { getEducation } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminEducationPage() {
  const education = await getEducation()

  // Ensure gpa is mapped as string | null
  const formattedEducation = education.map((e: any) => ({
    ...e,
    gpa: e.gpa ? String(e.gpa) : null
  }))

  return (
    <div className="w-full">
      <EducationCrud initialEducation={formattedEducation} />
    </div>
  )
}
