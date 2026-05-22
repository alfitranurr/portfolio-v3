import * as React from 'react'
import { ProfileForm } from '@/components/admin/profile-form'
import { getProfile } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const profile = await getProfile()

  return (
    <div className="w-full">
      <ProfileForm initialProfile={profile} />
    </div>
  )
}
