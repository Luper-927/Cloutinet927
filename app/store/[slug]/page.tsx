import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

async function getStoreData(slug: string) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
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

  await supabase.from('analytics_events').insert({
    event_type: 'page_view',
    business_slug: slug,
    source: 'store_page',
  })

  return { profile, products: products || [] }
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
    openGraph: { title, description, type: 'website', images: image ? [{ url: image }] : [] },
    twitter: { card: 'summary_large_image' as const, title, description, images: image ? [image] : [] },
  }
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const data = await getStoreData(params.slug)
  if (!data) return notFound()

  const { profile, products } = data

  const sameAs: string[] = []
  if (profile.facebook_url) sameAs.push(profile.facebook_url)
  if (profile.instagram_url) sameAs.push(profile.instagram_url)
  if (profile.youtube_url) sameAs.push(profile.youtube_url)
  if (profile.tiktok_url) sameAs.push(profile.tiktok_url)

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.business_name,
    description: profile.tagline,
    address: profile.location,
    telephone: profile.phone,
  }
  if (sameAs.length > 0) schema.sameAs = sameAs
  if (profile.business_hours) schema.openingHours = profile.business_hours

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cloutinet.online' },
      { '@type': 'ListItem', position: 2, name: profile.business_name, item: 'https://cloutinet.online/store/' + params.slug },
    ]
  }

  const whatsappLink = profile.phone
    ? 'https://wa.me/' + profile.phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent('Hello, I found your business on Cloutinet and would like to know more.')
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

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
      </nav>

      <section style={{ background: '#0F172A', padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>{profile.business_name}</h1>
        {profile.business_category && <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>{profile.business_category}</div>}
        {profile.tagline && <p style={{ fontSize: '13px', color: '#CBD5E1' }}>{profile.tagline}</p>}
        {profile.location && <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{profile.location}</p>}
      </section>

      {whatsappLink && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <a href={whatsappLink} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#16A34A', color: '#fff', padding: '12px 28px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700
          }}>Contact on WhatsApp</a>
        </div>
      )}

      {(profile.business_hours || servicesList.length > 0 || socialLinks.length > 0) && (
        <section style={{ maxWidth: '700px', margin: '0 auto 24px', padding: '0 16px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#0F172A' }}>Business Info</h2>
            {profile.business_hours && (
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Hours: {profile.business_hours}</div>
            )}
            {profile.location && (
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Location: {profile.location}</div>
            )}
            {profile.phone && (
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Phone: {profile.phone}</div>
            )}
            {servicesList.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Services & Products</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {servicesList.map((s: string, i: number) => (
                    <span key={i} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '3px 10px', fontSize: '12px', color: '#475569' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {socialLinks.map(s => (
                  <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#0F172A', textDecoration: 'none', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '3px 10px' }}>{s.label}</a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 40px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>Products & Services</h2>
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>No products listed yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {products.map((p: any) => (
              <Link key={p.id} href={'/store/' + params.slug + '/' + p.slug} style={{ textDecoration: 'none', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                {p.image_url && <img src={p.image_url} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />}
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
                  {p.price && <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{p.currency} {Number(p.price).toLocaleString()}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer style={{ background: '#F8FAFC', padding: '24px', textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700, marginBottom: '8px' }}>Is your business visible on Google?</div>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>This page was automatically generated by Cloutinet.</p>
        <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '10px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Create Your Own Free Page →</Link>
      </footer>
    </div>
  )
}
