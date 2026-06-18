import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cloutinet — Create. Share. Grow.',
  description: 'Create a free business page, list your products and services, and get found on Google. Built for small businesses in Nigeria and beyond.',
  metadataBase: new URL('https://cloutinet.online'),
  verification: {
    google: 'CRx67pQlEwCou57kseSwTkoeWymJL2M9wqv6CtY9FKA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Cloutinet',
    url: 'https://cloutinet.online',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
    description: 'Nigeria free business visibility platform. Helps SMEs get found on Google and receive customer inquiries via WhatsApp. Free business page, product listings, WhatsApp lead capture.',
    inLanguage: 'en-NG',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
    },
    creator: {
      '@type': 'Person',
      name: 'Luper David',
      nationality: 'Nigerian',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Small Business Owners, SMEs, Entrepreneurs, Nigerian Businesses',
    },
    keywords: 'Nigerian business directory, WhatsApp business Nigeria, SME Nigeria, get found on Google Nigeria, free business page Nigeria, Port Harcourt businesses, Lagos businesses, Abuja businesses',
    sameAs: [
      'https://github.com/Luper-927/Cloutinet927',
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
