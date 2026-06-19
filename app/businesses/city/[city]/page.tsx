import { supabase } from '../../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 3600

const cityMap: Record<string, string> = {
  'lagos': 'Lagos',
  'abuja': 'Abuja',
  'port-harcourt': 'Port Harcourt',
  'kano': 'Kano',
  'ibadan': 'Ibadan',
  'benin-city': 'Benin City',
  'enugu': 'Enugu',
  'owerri': 'Owerri',
  'warri': 'Warri',
  'kaduna': 'Kaduna',
  'makurdi': 'Makurdi',
  'jos': 'Jos',
  'calabar': 'Calabar',
  'uyo': 'Uyo',
  'asaba': 'Asaba',
  'ilorin': 'Ilorin',
  'abeokuta': 'Abeokuta',
  'akure': 'Akure',
  'awka': 'Awka',
  'umuahia': 'Umuahia',
}

async function getCityBusinesses(citySlug: string) {
  const cityName = cityMap[citySlug]
  if (!cityName) return null

  const { data: businesses } = await supabase
    .from('profiles')
    .select('business_name, business_slug, business_category, location, tagline, phone')
    .ilike('location', '%' + cityName + '%')
    .not('business_name', 'is', null)
    .not('business_slug', 'is', null)
    .order('created_at', { ascending: false })

  return { cityName, businesses: businesses || [] }
}

export async function generateMetadata({ params }: { params: { city: string } }) {
  const data = await getCityBusinesses(params.city)
  if (!data) return { title: 'City Not Found | Cloutinet' }

  return {
    title: `Businesses in ${data.cityName} | Cloutinet Directory`,
    description: `Find verified businesses in ${data.cityName}, Nigeria. Browse restaurants, shops, salons and more. Contact directly on WhatsApp. Free on Cloutinet.`,
  }
}

export function generateStaticParams() {
  return Object.keys(cityMap).map(city => ({ city }))
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const data = await getCityBusinesses(params.city)
  if (!data) return notFound()

  const { cityName, businesses } = data

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Businesses in ${cityName}, Nigeria`,
    description: `Verified businesses in ${cityName} on Cloutinet`,
    url: `https://cloutinet.online/businesses/city/${params.city}`,
    numberOfItems: businesses.length,
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </Link>
        <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Get Started Free</Link>
      </nav>

      <section style={{ background: 'linear-gradient(135deg, #6B21A8, #9333EA)', padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
          <Link href="/businesses" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>All Businesses</Link> → {cityName}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Businesses in {cityName}</h1>
        <p style={{ fontSize: '13px', opacity: 0.85 }}>Browse {businesses.length} verified businesses in {cityName}, Nigeria. Contact directly on WhatsApp.</p>
      </section>

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        {businesses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No businesses in {cityName} yet</h2>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Be the first business in {cityName} on Cloutinet</p>
            <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>List Your Business Free →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {businesses.map((b: any) => (
              <Link key={b.business_slug} href={'/store/' + b.business_slug} style={{
                textDecoration: 'none', color: '#1a1a2e',
                border: '1px solid #eee', borderRadius: '12px', padding: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{b.business_name}</div>
                  <div style={{ fontSize: '11px', color: '#6B21A8', marginBottom: '2px' }}>{b.business_category}</div>
                  {b.location && <div style={{ fontSize: '11px', color: '#888' }}>📍 {b.location}</div>}
                </div>
                <div style={{ color: '#6B21A8', fontSize: '18px', flexShrink: 0 }}>→</div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: '32px', background: '#f9f5ff', border: '1px solid #e5d5ff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Have a business in {cityName}?</div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '14px' }}>List it for free and get found on Google</p>
          <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>List Your Business Free →</Link>
        </div>
      </section>

      <footer style={{ background: '#f9f5ff', padding: '24px', textAlign: 'center', borderTop: '1px solid #e5d5ff', marginTop: '20px' }}>
        <Link href="/businesses" style={{ color: '#6B21A8', fontSize: '13px', textDecoration: 'none' }}>← Browse All Businesses</Link>
      </footer>
    </div>
  )
}
