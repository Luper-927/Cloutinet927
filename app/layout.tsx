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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
                ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

                ttq.load('D8R47VBC77U2T659MTN0');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      <link rel="icon" href="/favicon.ico" />
      <body>{children}</body>
    </html>
  )
}
