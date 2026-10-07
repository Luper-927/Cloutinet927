import DashboardShell from '../components/DashboardShell'
import { uiCss } from './ui'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{uiCss}</style>
      <DashboardShell>{children}</DashboardShell>
    </>
  )
}
