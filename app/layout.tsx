import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cloutinet — Create. Share. Grow.',
  description: 'Create a free business page, list your products and services, and get found on Google. Built for small businesses in Nigeria and beyond.',
  metadataBase: new URL('https://cloutinet.online'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
