import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export const revalidate = 3600

async function getDirectoryData() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('business_name, business_slug, business_category, location, tagline, phone')
    .not('business_name', 'is', null)
    .not('business_slug', 'is', null)
    .order('created_at', { ascending: false })

  return profiles || []
}

export async function generateMetadata() {
  return {
    title: 'Find Businesses in Nigeria | Cloutinet Business Directory',
    description: 'Browse thousands of verified businesses across Nigeria. Find restaurants, salons, shops, fashion, electronics and more. Contact businesses directly on WhatsApp.',
  }
}

export default async function BusinessesPage() {
  const businesses = await getDirectoryData()

  const categories = [
    'Food & Groceries',
    'Fashion & Clothing',
    'Electronics & Gadgets',
    'Furniture & Interior',
    'Building Materials',
    'Supermarket & Store',
    'Wholesale & Distribution',
    'Salon & Hair',
    'Barber Shop',
    'Spa & Massage',
    'Cosmetics & Skincare',
    'Gym & Fitness',
    'Restaurant & Eatery',
    'Fast Food & Snacks',
    'Catering Services',
    'Bakery & Pastry',
    'Bar & Drinks',
    'Logistics & Delivery',
    'Printing & Graphics',
    'Photography & Video',
    'Event Planning',
    'Cleaning Services',
    'Security Services',
    'Laundry & Dry Cleaning',
    'Tailoring & Fashion Design',
    'Shoe Making & Repair',
    'Pharmacy & Chemist',
    'Hospital & Clinic',
    'Optical Services',
    'Dental Care',
    'Herbal & Natural Health',
    'Real Estate & Property',
    'Architecture & Design',
    'Plumbing & Electrical',
    'Building & Construction',
    'Paint & Finishing',
    'School & Tutorial',
    'Church & Ministry',
    'Mosque & Islamic Center',
    'Skills & Training',
    'Tech & IT Services',
    'Phone Repair',
    'Computer Services',
    'Digital Marketing',
    'Farming & Agriculture',
    'Livestock & Poultry',
    'Fish Farming',
    'Crop Production',
    'Car Sales',
    'Auto Repair & Mechanic',
    'Spare Parts',
    'Car Wash & Detailing',
    'Financial Services',
    'Insurance',
    'POS & Mobile Money',
    'Other',
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cloutinet Business Directory',
    description: 'Find businesses across Nigeria on Cloutinet',
    url: 'https://cloutinet.online/businesses',
  }

  function slugifyCategory(cat: string) {
    return cat.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
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
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>Find Businesses in Nigeria</h1>
        <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '400px', margin: '0 auto' }}>Browse verified businesses across Nigeria. Contact them directly on WhatsApp.</p>
        <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.7 }}>{businesses.length} businesses listed</div>
      </section>

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Browse by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '32px' }}>
          {categories.map(cat => (
            <Link key={cat} href={'/businesses/' + slugifyCategory(cat)} style={{
              background: '#f9f5ff', border: '1px solid #e5d5ff',
              borderRadius: '8px', padding: '10px 12px',
              textDecoration: 'none', color: '#6B21A8',
              fontSize: '12px', fontWeight: 600, textAlign: 'center'
            }}>{cat}</Link>
          ))}
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Recently Added Businesses</h2>
        {businesses.length === 0 ? (
          <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No businesses listed yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {businesses.slice(0, 20).map((b: any) => (
              <Link key={b.business_slug} href={'/store/' + b.business_slug} style={{
                textDecoration: 'none', color: '#1a1a2e',
                border: '1px solid #eee', borderRadius: '12px', padding: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{b.business_name}</div>
                  {b.business_category && <div style={{ fontSize: '11px', color: '#6B21A8', marginBottom: '2px' }}>{b.business_category}</div>}
                  {b.location && <div style={{ fontSize: '11px', color: '#888' }}>📍 {b.location}</div>}
                </div>
                <div style={{ color: '#6B21A8', fontSize: '18px' }}>→</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer style={{ background: '#f9f5ff', padding: '24px', textAlign: 'center', borderTop: '1px solid #e5d5ff', marginTop: '20px' }}>
        <div style={{ fontSize: '13px', color: '#6B21A8', marginBottom: '8px' }}>📦 Is your business listed here?</div>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Join thousands of businesses getting found on Google with Cloutinet.</p>
        <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>List Your Business Free →</Link>
      </footer>
    </div>
  )
}
