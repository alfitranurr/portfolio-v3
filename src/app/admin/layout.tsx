import * as React from 'react'
import { AdminSidebar } from '@/components/admin-sidebar'

export const metadata = {
  title: 'Admin Console',
  description: 'Administrator Command Center for Portfolio management.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminSidebar />
      <div className="w-full">
        {children}
      </div>
    </>
  )
}
