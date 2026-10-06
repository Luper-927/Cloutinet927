'use client'

import { usePathname } from 'next/navigation'
import DashboardShell from '../components/DashboardShell'

// Pages that show the new navigation. Add a path here each time a page
// has had its own header/menu removed. When every page is converted,
// delete this list and pass chrome={true} (or remove the prop).
const SHELL_PAGES = [
  '/dashboard',
  '/dashboard/customers',
  '/dashboard/customers/new',
  '/dashboard/customers/message',
  '/dashboard/payments',
  '/dashboard/payments/requests',
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showChrome = !!pathname && SHELL_PAGES.includes(pathname)

  return <DashboardShell chrome={showChrome}>{children}</DashboardShell>
}
