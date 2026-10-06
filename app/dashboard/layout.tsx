'use client'

import { usePathname } from 'next/navigation'
import DashboardShell from '../components/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // TEMPORARY: sub-pages still render their own menu, so the shell
  // only applies to the dashboard home for now. Remove this condition
  // once the sub-pages have had their own menus removed.
  if (pathname !== '/dashboard') {
    return <>{children}</>
  }

  return <DashboardShell>{children}</DashboardShell>
}
