'use client'

import { usePathname } from 'next/navigation'
import DashboardShell from '../components/DashboardShell'

// Pages that have been converted to the new shell. Add a path here each
// time a page has had its own header/menu removed. Once every page under
// /dashboard is converted, delete this list and always render the shell.
const SHELL_PAGES = [
  '/dashboard',
  '/dashboard/customers',
  '/dashboard/payments',
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (!pathname || !SHELL_PAGES.includes(pathname)) {
    return <>{children}</>
  }

  return <DashboardShell>{children}</DashboardShell>
}
