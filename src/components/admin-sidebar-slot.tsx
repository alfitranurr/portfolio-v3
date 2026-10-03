'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// Dimuat hanya saat benar-benar dirender (di /admin), jadi kode sidebar admin
// tidak ikut terunduh di halaman publik. Posisi di DOM tetap sama (root layout).
const AdminSidebar = dynamic(() => import('@/components/admin-sidebar').then((m) => m.AdminSidebar))

export function AdminSidebarSlot() {
  const pathname = usePathname()
  if (!pathname?.startsWith('/admin')) return null
  return <AdminSidebar />
}
