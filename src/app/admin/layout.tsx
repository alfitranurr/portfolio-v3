import * as React from 'react'

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
    <div className="w-full">
      {children}
    </div>
  )
}
