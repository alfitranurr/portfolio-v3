import { getSkills } from '@/lib/data-service'
import { SkillsCrud } from '@/components/admin/skills'

export const dynamic = 'force-dynamic'

export default async function AdminSkillsPage() {
  const skills = await getSkills()

  return <SkillsCrud initialSkills={skills} />
}
