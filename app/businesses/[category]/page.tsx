import { supabase } from '../../../lib/supabase'
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

const categoryBlurb: Record<string, string> = {
  'food-groceries': 'From local food vendors to grocery stores, businesses in this category keep households and communities stocked with everyday essentials.',
  'fashion-clothing': 'Tailors, boutiques, and clothing lines that help people across Nigeria dress well, on trend, and on budget.',
  'electronics-gadgets': 'Phone, laptop, and gadget sellers helping Nigerians stay connected and equipped.',
  'furniture-interior': 'Furniture makers and interior decorators shaping homes and offices across the country.',
  'building-materials': 'Suppliers of cement, blocks, roofing, and everything else a construction project needs.',
  'supermarket-store': 'Neighbourhood supermarkets and general stores serving daily shopping needs.',
  'wholesale-distribution': 'Wholesalers and distributors moving goods at scale across Nigerian markets.',
  'salon-hair': 'Hair stylists and salons helping clients look their best.',
  'barber-shop': 'Barbershops delivering sharp cuts and grooming across Nigerian neighbourhoods.',
  'spa-massage': 'Spas and wellness centers offering relaxation and self-care.',
  'cosmetics-skincare': 'Skincare and beauty businesses helping customers look and feel their best.',
  'gym-fitness': 'Gyms and fitness trainers helping Nigerians stay active and healthy.',
  'restaurant-eatery': 'Restaurants and eateries serving up local and international dishes.',
  'fast-food-snacks': 'Fast food spots and snack vendors feeding busy Nigerians on the go.',
  'catering-services': 'Caterers bringing great food to events, offices, and celebrations.',
  'bakery-pastry': 'Bakeries and pastry shops turning out fresh bread, cakes, and treats.',
  'bar-drinks': 'Bars and drink spots serving up refreshments and good times.',
  'logistics-delivery': 'Logistics and delivery businesses keeping goods moving across Nigeria.',
  'printing-graphics': 'Printing shops and graphic designers bringing ideas to paper and screen.',
  'photography-video': 'Photographers and videographers capturing life\u2019s biggest moments.',
  'event-planning': 'Event planners turning ideas into unforgettable celebrations.',
  'cleaning-services': 'Cleaning businesses keeping homes and offices spotless.',
  'security-services': 'Security providers keeping people and property safe.',
  'laundry-dry-cleaning': 'Laundry and dry-cleaning services keeping wardrobes fresh.',
  'tailoring-fashion-design': 'Tailors and fashion designers creating custom, made-to-fit pieces.',
  'shoe-making-repair': 'Shoemakers and cobblers crafting and repairing footwear.',
  'pharmacy-chemist': 'Pharmacies and chemists providing essential medicines and health products.',
  'hospital-clinic': 'Hospitals and clinics providing healthcare across Nigerian communities.',
  'optical-services': 'Opticians and eyewear businesses helping people see clearly.',
  'dental-care': 'Dental clinics keeping smiles healthy.',
  'herbal-natural-health': 'Herbal and natural health practitioners offering traditional wellness solutions.',
  'real-estate-property': 'Real estate agents and property businesses helping people find homes and space.',
  'architecture-design': 'Architects and designers shaping Nigeria\u2019s built environment.',
  'plumbing-electrical': 'Plumbers and electricians keeping homes and businesses running.',
  'building-construction': 'Construction companies and builders bringing structures to life.',
  'paint-finishing': 'Painters and finishing specialists giving buildings their final touch.',
  'school-tutorial': 'Schools and tutorial centers supporting learning at every level.',
  'church-ministry': 'Churches and ministries serving their communities.',
  'mosque-islamic-center': 'Mosques and Islamic centers serving their communities.',
  'skills-training': 'Skills trainers helping Nigerians build new capabilities.',
  'tech-it-services': 'Tech and IT businesses solving digital problems for individuals and companies.',
  'phone-repair': 'Phone repair technicians keeping devices working.',
  'computer-services': 'Computer repair and services businesses keeping devices running.',
  'digital-marketing': 'Digital marketers helping businesses grow their reach online.',
  'farming-agriculture': 'Farmers and agribusinesses feeding Nigeria.',
  'livestock-poultry': 'Livestock and poultry farmers supplying meat and eggs across the country.',
  'fish-farming': 'Fish farmers supplying fresh fish to local markets.',
  'crop-production': 'Crop farmers growing the food Nigeria depends on.',
  'car-sales': 'Car dealers helping Nigerians find their next vehicle.',
  'auto-repair-mechanic': 'Mechanics and auto repair shops keeping vehicles on the road.',
  'spare-parts': 'Spare parts dealers supplying the components vehicles need.',
  'car-wash-detailing': 'Car wash and detailing businesses keeping vehicles looking sharp.',
  'financial-services': 'Financial service providers helping people manage and grow their money.',
  'insurance': 'Insurance providers helping Nigerians protect what matters.',
  'pos-mobile-money': 'POS and mobile money agents providing everyday financial access.',
  'other': 'A wide range of Nigerian businesses that don\u2019t fit neatly into one category, but deserve to be found too.',
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

async function getCategoryBusinesses(category: string) {
  const categoryName = categoryMap[category]
  if (!categoryName) return null

  const { data: businesses } = await supabase
    .from('profiles')
    .select('business_name, business_slug, business_category, location, tagline, phone')
    .eq('business_category', categoryName)
    .not('business_name', 'is', null)
    .not('business_slug', 'is', null)
    .order('created_at', { ascending: false })

  return { categoryName, businesses: businesses || [] }
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const data = await getCategoryBusinesses(params.category)
  if (!data) return { title: 'Category Not Found | Cloutinet' }

  return {
    title: `Best ${data.categoryName} Businesses in Nigeria | Cloutinet`,
    description: `Find verified ${data.categoryName} businesses in Nigeria. Browse listings, view products and prices, contact directly on WhatsApp. Free on Cloutinet.`,
  }
}

export function generateStaticParams() {
  return Object.keys(categoryMap).map(cat => ({ category: cat }))
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const data = await getCategoryBusinesses(params.category)
  if (!data) return notFound()

  const { categoryName, businesses } = data
  const blurb = categoryBlurb[params.category] || `Nigerian businesses in the ${categoryName} category, ready to be found by customers searching online.`

  const otherCategories = Object.entries(categoryMap)
    .filter(([slug]) => slug !== params.category)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${categoryName} Businesses in Nigeria`,
    description: `Verified ${categoryName} businesses in Nigeria on Cloutinet`,
    url: `https://cloutinet.online/businesses/${params.category}`,
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
          <Link href="/businesses" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>All Businesses</Link> → {categoryName}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Best {categoryName} in Nigeria</h1>
        <p style={{ fontSize: '13px', opacity: 0.85, maxWidth: '480px', margin: '0 auto' }}>{blurb}</p>
      </section>

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        {businesses.length === 0 ? (
          <div>
            <div style={{ textAlign: 'center', padding: '32px 20px 8px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Be the first {categoryName} business on Cloutinet</h2>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 20px' }}>
                {blurb} Cloutinet gives {categoryName.toLowerCase()} businesses in Nigeria a free, Google-searchable
                page — so when someone nearby searches for what you offer, they can find you and reach out directly
                on WhatsApp.
              </p>
              <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>List Your Business Free →</Link>
            </div>

            <div style={{ marginTop: '28px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '10px', textAlign: 'center' as const }}>Explore other categories</p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' }}>
                {otherCategories.map(([slug, name]) => (
                  <Link key={slug} href={'/businesses/' + slug} style={{
                    fontSize: '12px', color: '#0F172A', textDecoration: 'none',
                    border: '1px solid #E2E8F0', borderRadius: '999px', padding: '6px 12px'
                  }}>
                    {name}
                  </Link>
                ))}
              </div>
            </div>
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

        <div style={{ marginTop: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '10px', textAlign: 'center' as const }}>Browse {categoryName} by City</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' }}>
            {Object.entries(cityMap).map(([citySlug, cityName]) => (
              <Link key={citySlug} href={'/businesses/' + params.category + '/' + citySlug} style={{
                fontSize: '12px', color: '#0F172A', textDecoration: 'none',
                border: '1px solid #E2E8F0', borderRadius: '999px', padding: '6px 12px'
              }}>
                {cityName}
              </Link>
            ))}
          </div>
        </div>

        {businesses.length > 0 && (
          <div style={{ marginTop: '32px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Are you a {categoryName} business?</div>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '14px' }}>List your business for free and get found on Google</p>
            <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>List Your Business Free →</Link>
          </div>
        )}
      </section>

      <footer style={{ background: '#F8FAFC', padding: '24px', textAlign: 'center', borderTop: '1px solid #E2E8F0', marginTop: '20px' }}>
        <Link href="/businesses" style={{ color: '#0F172A', fontSize: '13px', textDecoration: 'none' }}>← Browse All Categories</Link>
      </footer>
    </div>
  )
}
