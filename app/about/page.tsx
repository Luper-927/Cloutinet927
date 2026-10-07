import Link from 'next/link'
import { PublicNav, PublicFooter } from '../components/PublicChrome'

export const metadata = {
  title: 'About | Cloutinet',
  description: 'Cloutinet is the Business Operating System: one connected platform for operations, customers, payments and growth.',
}

const AREAS = [
  {
    title: 'Run',
    items: ['Employees with roles and permissions', 'Documents in one place', 'An activity log of who did what', 'An AI assistant that answers questions about your business'],
  },
  {
    title: 'Grow',
    items: ['Customer records and follow-up flags', 'Payment requests and payment records', 'Products and services with photos and prices', 'Marketing campaigns with AI-generated copy'],
  },
  {
    title: 'Connect',
    items: ['A public business page that search engines can find', 'WhatsApp and call buttons, with views and taps tracked', 'Integrations with analytics, messaging and webhooks', 'A developer API and a Trust-Score API'],
  },
]

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'inherit', background: '#fff', color: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNav />

      <section style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 20px', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ color: '#2563EB', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Our story</div>
        <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 18px', lineHeight: 1.15 }}>
          One connected system for running your business
        </h1>

        <p style={paragraphStyle}>
          We built Cloutinet because running a business shouldn&apos;t depend on stitching together a dozen disconnected tools, or on having the budget for an agency or a full operations team. From a single-owner startup to an established company, every business deserves the same connected foundation.
        </p>
        <p style={paragraphStyle}>
          Cloutinet is a business operating system: one place to run your operations, teams, customers, payments and growth, with a public business presence that makes your business accessible to customers, search engines and other systems.
        </p>
        <p style={paragraphStyle}>
          We build it to be fast, lightweight and ready to scale, from independent shops and service providers to companies with several locations, across Nigeria and other emerging markets, where data is expensive and every second of load time matters.
        </p>
        <p style={{ ...paragraphStyle, marginBottom: '32px' }}>
          At its core, Cloutinet is infrastructure. The technology should do the complicated work, such as connecting your records, tracking activity and keeping your public page discoverable, so you can spend your time serving customers.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 14px' }}>What Cloutinet does today</h2>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '36px' }}>
          {AREAS.map(area => (
            <div key={area.title} style={{ background: '#F5F7FB', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>{area.title}</div>
              {area.items.map(item => (
                <div key={item} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2563EB', marginTop: '9px', flexShrink: 0 }} />
                  <span style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ background: '#0A0E27', borderRadius: '16px', padding: '28px 20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 8px', color: '#fff' }}>Run your business from one place.</h3>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 18px' }}>Start free and add more as you grow.</p>
          <Link href="/auth" style={{ display: 'inline-block', background: '#2563EB', color: '#fff', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Start Free
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

const paragraphStyle: React.CSSProperties = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: 1.7,
  margin: '0 0 20px',
}
