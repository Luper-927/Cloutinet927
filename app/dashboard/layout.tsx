'use client'

import { usePathname } from 'next/navigation'
import DashboardShell from '../components/DashboardShell'

// Pages that show the new navigation. Add a path here each time a page
// has had its own header/menu removed. When every page is converted,
// delete this and always pass chrome={true} (or remove the prop).
const SHELL_PAGES = [
  '/dashboard',
  '/dashboard/customers',
  '/dashboard/customers/new',
  '/dashboard/customers/message',
  '/dashboard/payments',
  '/dashboard/payments/requests',
  '/dashboard/documents',
  '/dashboard/activity',
  '/dashboard/ai',
]

// Whole sections converted, including dynamic routes like /employees/[id]
const SHELL_PREFIXES = [
  '/dashboard/employees',
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showChrome =
    !!pathname &&
    (SHELL_PAGES.includes(pathname) ||
      SHELL_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/')))

  return <DashboardShell chrome={showChrome}>{children}</DashboardShell>
}
