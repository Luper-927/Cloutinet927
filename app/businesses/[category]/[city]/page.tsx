import { supabase } from '../../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 3600

const categoryMap: Record<string, string> = {
  'food-groceries': 'Food & Groceries',
  'fashion-clothing': 'Fashion & Clothing',
  'electronics-gadgets': 'Electronics & Gadgets',
  'furniture-interior': 'Furniture & Interior',
  'building-materials': 'Building Materials',
  'supermarket-store': 'Supermarket & Store',
  'wholesale-distribution': 'Wholesale & Distribution',
  'salon-hair': 'Salon & Hair',
  'barber-shop': 'Barber Shop',
  'spa-massage': 'Spa & Massage',
  'cosmetics-skincare': 'Cosmetics & Skincare',
  'gym-fitness': 'Gym & Fitness',
  'restaurant-eatery': 'Restaurant & Eatery',
  'fast-food-snacks': 'Fast Food & Snacks',
  'catering-services': 'Catering Services',
  'bakery-pastry': 'Bakery & Pastry',
  'bar-drinks': 'Bar & Drinks',
  'logistics-delivery': 'Logistics & Delivery',
  'printing-graphics': 'Printing & Graphics',
  'photography-video': 'Photography & Video',
  'event-planning': 'Event Planning',
  'cleaning-services': 'Cleaning Services',
  'security-services': 'Security Services',
  'laundry-dry-cleaning': 'Laundry & Dry Cleaning',
  'tailoring-fashion-design': 'Tailoring & Fashion Design',
  'shoe-making-repair': 'Shoe Making & Repair',
  'pharmacy-chemist': 'Pharmacy & Chemist',
  'hospital-clinic': 'Hospital & Clinic',
  'optical-services': 'Optical Services',
  'dental-care': 'Dental Care',
  'herbal-natural-health': 'Herbal & Natural Health',
  'real-estate-property': 'Real Estate & Property',
  'architecture-design': 'Architecture & Design',
  'plumbing-electrical': 'Plumbing & Electrical',
  'building-construction': 'Building & Construction',
  'paint-finishing': 'Paint & Finishing',
  'school-tutorial': 'School & Tutorial',
  'church-ministry': 'Church & Ministry',
  'mosque-islamic-center': 'Mosque & Islamic Center',
  'skills-training': 'Skills & Training',
  'tech-it-services': 'Tech & IT Services',
  'phone-repair': 'Phone Repair',
  'computer-services': 'Computer Services',
  'digital-marketing': 'Digital Marketing',
  'farming-agriculture': 'Farming & Agriculture',
  'livestock-poultry': 'Livestock & Poultry',
  'fish-farming': 'Fish Farming',
  'crop-production': 'Crop Production',
  'car-sales': 'Car Sales',
  'auto-repair-mechanic': 'Auto Repair & Mechanic',
  'spare-parts': 'Spare Parts',
  'car-wash-detailing': 'Car Wash & Detailing',
  'financial-services': 'Financial Services',
  'insurance': 'Insurance',
  'pos-mobile-money': 'POS & Mobile Money',
  'other': 'Other',
}

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

async function getBusinesses(categorySlug: string, citySlug: string) {
  const categoryName = categoryMap[categorySlug]
  const cityName = cityMap[citySlug]
  if (!categoryName || !cityName) return null

  const { data: businesses } = await supabase
    .from('profiles')
    .select('business_name, business_slug, business_category, location, tagline, phone')
    .eq('business_category', categoryName)
    .ilike('location', '%' + cityName + '%')
    .not('business_name', 'is', null)
    .not('business_slug', 'is', null)
    .order('created_at', { ascending: false })

  return { categoryName, cityName, businesses: businesses || [] }
}

export async function generateMetadata({ params }: { params: { category: string; city: string } }) {
  const data = await getBusinesses(params.category, params.city)
  if (!data) return { title: 'Not Found | Cloutinet' }

  return {
    title: `${data.categoryName} in ${data.cityName} | Cloutinet`,
    description: `Find verified ${data.categoryName} businesses in ${data.cityName}, Nigeria. View products and prices, contact directly on WhatsApp. Free on Cloutinet.`,
  }
}

export default async function CategoryCityPage({ params }: { params: { category: string; city: string } }) {
  const data = await getBusinesses(params.category, params.city)
  if (!data) return notFound()

  const { categoryName, cityName, businesses } = data

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} in ${cityName}, Nigeria`,
    description: `Verified ${categoryName} businesses in ${cityName} on Cloutinet`,
    url: `https://cloutinet.online/businesses/${params.category}/${params.city}`,
    numberOfItems: businesses.length,
    itemListElement: businesses.slice(0, 10).map((b: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: b.business_name,
        address: b.location,
        url: `https://cloutinet.online/store/${b.business_slug}`,
      }
    }))
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
        <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Get Started Free</Link>
      </nav>

      <section style={{ background: '#0F172A', padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
          <Link href="/businesses" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>All Businesses</Link>
          {' → '}
          <Link href={'/businesses/' + params.category} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{categoryName}</Link>
          {' → '}{cityName}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{categoryName} in {cityName}</h1>
        <p style={{ fontSize: '13px', opacity: 0.85, maxWidth: '480px', margin: '0 auto' }}>
          Browse {businesses.length} verified {categoryName.toLowerCase()} businesses in {cityName}, Nigeria. Contact directly on WhatsApp.
        </p>
      </section>

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        {businesses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px 8px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              Be the first {categoryName} business in {cityName} on Cloutinet
            </h2>
            <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 20px' }}>
              Cloutinet gives {categoryName.toLowerCase()} businesses in {cityName} a free, Google-searchable
              page — so when someone nearby searches for what you offer, they can find you and reach out directly
              on WhatsApp.
            </p>
            <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>List Your Business Free →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {businesses.map((b: any) => (
              <Link key={b.business_slug} href={'/store/' + b.business_slug} style={{
                textDecoration: 'none', color: '#0F172A',
                border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{b.business_name}</div>
                  <div style={{ fontSize: '11px', color: '#0F172A', marginBottom: '2px' }}>{b.business_category}</div>
                  {b.location && <div style={{ fontSize: '11px', color: '#64748B' }}>📍 {b.location}</div>}
                  {b.tagline && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{b.tagline}</div>}
                </div>
                <div style={{ color: '#0F172A', fontSize: '18px', flexShrink: 0 }}>→</div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: '32px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Are you a {categoryName} business in {cityName}?</div>
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '14px' }}>List your business for free and get found on Google</p>
          <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>List Your Business Free →</Link>
        </div>
      </section>

      <footer style={{ background: '#F8FAFC', padding: '24px', textAlign: 'center', borderTop: '1px solid #E2E8F0', marginTop: '20px' }}>
        <Link href={'/businesses/' + params.category} style={{ color: '#0F172A', fontSize: '13px', textDecoration: 'none' }}>← Back to {categoryName}</Link>
      </footer>
    </div>
  )
}
