'use client'

import { usePathname } from 'next/navigation'
import DashboardShell from '../components/DashboardShell'
import { uiCss } from './ui'

// Pages already restyled for the dark theme. Add a path here each time a page
// is converted. Pages not listed still work: they show on a white panel inside
// the dark frame until they are converted. When every page is converted,
// delete this list and always pass dark.
const DARK_PAGES = [
  '/dashboard',
  '/dashboard/customers',
  '/dashboard/customers/new',
  '/dashboard/customers/message',
  '/dashboard/payments',
  '/dashboard/payments/requests',
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const dark = !!pathname && DARK_PAGES.includes(pathname)

  return (
    <>
      <style>{uiCss}</style>
      <DashboardShell dark={dark}>{children}</DashboardShell>
    </>
  )
}
