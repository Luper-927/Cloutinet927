import WhatsAppButton from '../../components/WhatsAppButton'
import FloatingWhatsAppButton from '../../components/FloatingWhatsAppButton'
import { supabase } from '../../../lib/supabase'
import { getSimilarBusinesses } from '../../../lib/similar-businesses'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cache } from 'react'

export const revalidate = 60

const getStoreData = cache(async (slug: string) => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, business_name, business_slug, business_category, phone, location, tagline, logo_url, business_hours, services, facebook_url, instagram_url, youtube_url, tiktok_url, business_id, created_at')
    .eq('business_slug', slug)
    .limit(1)

  const profile = profiles && profiles[0]
  if (!profile) return null

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return { profile, products: products || [] }
})

function trackPageView(slug: string) {
  supabase.from('analytics_events').insert({
    event_type: 'page_view',
    business_slug: slug,
    source: 'store_page',
  }).then(() => {}, () => {})
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getStoreData(params.slug)
  if (!data) return { title: 'Business Not Found | Cloutinet' }

  const { profile, products } = data
  const title = profile.business_name + (profile.business_category ? ' - ' + profile.business_category : '') + (profile.location ? ' in ' + profile.location : '') + ' | Cloutinet'
  const description = profile.tagline
    ? profile.tagline + (profile.location ? ' Located in ' + profile.location + '.' : '') + ' Contact us on WhatsApp.'
    : 'Find ' + profile.business_name + (profile.location ? ' in ' + profile.location : '') + '. Browse products and contact us on WhatsApp.'
  const image = products && products[0] && products[0].image_url ? products[0].image_url : null

  return {
    title,
    description,
    alternates: { canonical: '/store/' + params.slug },
    openGraph: { title, description, type: 'website', images: image ? [{ url: image }] : [] },
    twitter: { card: 'summary_large_image' as const, title, description, images: image ? [image] : [] },
  }
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const data = await getStoreData(params.slug)
  if (!data) return notFound()

  trackPageView(params.slug)

  const { profile, products } = data

  const similarBusinesses = await getSimilarBusinesses({
    id: profile.id,
    business_category: profile.business_category,
    location: profile.location,
  })

  const sameAs: string[] = []
  if (profile.facebook_url) sameAs.push(profile.facebook_url)
  if (profile.instagram_url) sameAs.push(profile.instagram_url)
  if (profile.youtube_url) sameAs.push(profile.youtube_url)
  if (profile.tiktok_url) sameAs.push(profile.tiktok_url)

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.business_name,
    url: 'https://cloutinet.online/store/' + params.slug,
  }
  if (profile.tagline) schema.description = profile.tagline
  if (profile.location) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
      addressCountry: 'NG',
    }
  }
  if (profile.phone) schema.telephone = profile.phone
  if (profile.business_hours) schema.openingHours = profile.business_hours
  if (sameAs.length > 0) schema.sameAs = sameAs

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is ' + profile.business_name + ' located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: profile.location ? profile.business_name + ' is located in ' + profile.location + '.' : 'Contact us on WhatsApp for location details.',
        }
      },
      {
        '@type': 'Question',
        name: 'How can I contact ' + profile.business_name + '?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can contact ' + profile.business_name + ' directly on WhatsApp' + (profile.phone ? ' at ' + profile.phone : '') + '. Visit our Cloutinet page and tap the WhatsApp button.',
        }
      },
      {
        '@type': 'Question',
        name: 'What does ' + profile.business_name + ' sell?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: profile.services ? profile.business_name + ' offers: ' + profile.services + '.' : 'Browse our products and services on this page.',
        }
      },
      {
        '@type': 'Question',
        name: 'What are ' + profile.business_name + ' opening hours?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: profile.business_hours ? profile.business_name + ' is open: ' + profile.business_hours + '.' : 'Contact us on WhatsApp for current opening hours.',
        }
      },
      {
        '@type': 'Question',
        name: 'Does ' + profile.business_name + ' deliver?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Contact ' + profile.business_name + ' directly on WhatsApp to ask about delivery options in ' + (profile.location || 'your area') + '.',
        }
      },
    ]
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cloutinet.online' },
      { '@type': 'ListItem', position: 2, name: 'Businesses', item: 'https://cloutinet.online/businesses' },
      { '@type': 'ListItem', position: 3, name: profile.business_name, item: 'https://cloutinet.online/store/' + params.slug },
    ]
  }

  const whatsappLink = profile.phone
    ? 'https://wa.me/' + profile.phone.replace(/[^0-9]/g, '').replace(/^0/, '234') + '?text=' + encodeURIComponent('Hello, I found ' + profile.business_name + ' on Cloutinet and I\u2019m interested in your products/services. Can you tell me more?')
    : null

  const servicesList = profile.services
    ? profile.services.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : []

  const socialLinks = [
    { url: profile.facebook_url, label: 'Facebook' },
    { url: profile.instagram_url, label: 'Instagram' },
    { url: profile.youtube_url, label: 'YouTube' },
    { url: profile.tiktok_url, label: 'TikTok' },
  ].filter(s => s.url)

  const faqs = [
    {
      q: 'Where is ' + profile.business_name + ' located?',
      a: profile.location ? profile.business_name + ' is located in ' + profile.location + '.' : 'Contact us on WhatsApp for location details.'
    },
    {
      q: 'How can I contact ' + profile.business_name + '?',
      a: 'Tap the WhatsApp button on this page to message us directly' + (profile.phone ? ' at ' + profile.phone : '') + '.'
    },
    {
      q: 'What does ' + profile.business_name + ' sell?',
      a: profile.services ? 'We offer: ' + profile.services + '.' : 'Browse our products below.'
    },
    {
      q: 'What are the opening hours?',
      a: profile.business_hours ? 'We are open: ' + profile.business_hours + '.' : 'Contact us on WhatsApp for current hours.'
    },
    {
      q: 'Does ' + profile.business_name + ' deliver?',
      a: 'Contact us on WhatsApp to ask about delivery options in ' + (profile.location || 'your area') + '.'
    },
  ]

  const infoRow = (label: string, value: string) => (
    <div style={{ fontSize: '14px', color: '#475569', marginBottom: '6px', lineHeight: 1.5 }}>
      <span style={{ color: '#94A3B8' }}>{label}: </span>{value}
    </div>
  )

  return (
    <div style={{ fontFamily: 'inherit', background: '#fff', color: '#0F172A' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {whatsappLink && (
        <FloatingWhatsAppButton href={whatsappLink} businessSlug={params.slug} />
      )}

      <nav style={{ background: '#0A0E27', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.01em', color: '#fff', textDecoration: 'none' }}>
            Cloutinet
          </Link>
          <Link href="/auth" style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textDecoration: 'none', background: '#2563EB', borderRadius: '8px', padding: '8px 14px' }}>
            Create your page
          </Link>
        </div>
      </nav>

      <section
        style={{
          background: '#0A0E27',
          backgroundImage:
            'radial-gradient(ellipse 700px 500px at 10% -10%, rgba(29,78,216,0.35), transparent 70%), radial-gradient(ellipse 600px 600px at 100% 0%, rgba(37,99,235,0.28), transparent 70%)',
          padding: '48px 20px 52px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.1 }}>{profile.business_name}</h1>
        {profile.business_category && <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>{profile.business_category}</div>}
        {profile.tagline && <p style={{ fontSize: '15px', color: '#CBD5E1', margin: '8px auto 0', maxWidth: '520px', lineHeight: 1.5 }}>{profile.tagline}</p>}
        {profile.location && <p style={{ fontSize: '13px', color: '#94A3B8', margin: '8px 0 0' }}>{profile.location}</p>}
      </section>

      {whatsappLink && (
        <div style={{ textAlign: 'center', padding: '24px 20px' }}>
          <WhatsAppButton href={whatsappLink} businessSlug={params.slug} label="Contact on WhatsApp" />
        </div>
      )}

      {(profile.business_hours || servicesList.length > 0 || socialLinks.length > 0 || profile.phone) && (
        <section style={{ maxWidth: '700px', margin: '0 auto 24px', padding: '0 16px' }}>
          <div style={{ background: '#F5F7FB', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', color: '#0F172A' }}>Business info</h2>
            {profile.location && infoRow('Location', profile.location)}
            {profile.phone && infoRow('Phone', profile.phone)}
            {profile.business_hours && infoRow('Hours', profile.business_hours)}
            {servicesList.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Services and products</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                  {servicesList.map((s: string, i: number) => (
                    <span key={i} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '999px', padding: '4px 12px', fontSize: '12px', color: '#475569' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                {socialLinks.map(s => (
                  <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', textDecoration: 'none', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '999px', padding: '4px 12px' }}>{s.label}</a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 16px', color: '#0F172A' }}>Products and services</h2>
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>No products listed yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {products.map((p: any, index: number) => (
              <Link key={p.id} href={'/store/' + params.slug + '/' + p.slug} style={{ textDecoration: 'none', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
                {p.image_url && (
                  <div style={{ position: 'relative' as const, width: '100%', height: '120px' }}>
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                      style={{ objectFit: 'cover' as const }}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      priority={index < 4}
                    />
                  </div>
                )}
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
                  {p.price && <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{p.currency} {Number(p.price).toLocaleString()}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {similarBusinesses.length > 0 && (
        <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 16px', color: '#0F172A' }}>
            Similar businesses{profile.location ? ' near ' + profile.location : ''}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {similarBusinesses.map((b) => (
              <Link
                key={b.business_slug}
                href={'/store/' + b.business_slug}
                style={{ textDecoration: 'none', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', display: 'block', background: '#fff' }}
              >
                {b.logo_url ? (
                  <div style={{ position: 'relative' as const, width: '100%', height: '90px', background: '#F5F7FB' }}>
                    <Image
                      src={b.logo_url}
                      alt={b.business_name}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      style={{ objectFit: 'cover' as const }}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '90px', background: '#F5F7FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#CBD5E1' }}>
                    {b.business_name.charAt(0)}
                  </div>
                )}
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{b.business_name}</div>
                  {b.business_category && <div style={{ fontSize: '12px', color: '#64748B' }}>{b.business_category}</div>}
                  {b.resolvedLocation && <div style={{ fontSize: '12px', color: '#94A3B8' }}>{b.resolvedLocation}</div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 16px', color: '#0F172A' }}>
          Common questions about {profile.business_name}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: '#F5F7FB', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                {faq.q}
              </div>
              <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.55 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: '#0A0E27', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', color: '#fff', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '8px' }}>
          Want a page like this for your business?
        </div>
        <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 auto 20px', maxWidth: '380px', lineHeight: 1.5 }}>
          {profile.business_name} has a public page on Cloutinet, the Business Operating System. Create yours free.
        </p>
        <Link href="/auth" style={{ display: 'inline-block', background: '#2563EB', color: '#fff', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Create Your Free Page
        </Link>
      </footer>
    </div>
  )
}
