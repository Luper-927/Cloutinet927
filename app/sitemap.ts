// app/sitemap.ts
import { MetadataRoute } from 'next'
import { supabase } from '../lib/supabase'

const baseUrl = 'https://cloutinet.online'

// Regenerate at most once an hour instead of hitting Supabase on every crawl request.
export const revalidate = 3600

// Fixed date for static pages that don't change often — update this
// manually only when you actually edit one of these pages.
const staticLastModified = new Date('2026-08-01')

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

function getStaticPages(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: staticLastModified, changeFrequency: 'daily', priority: 1 },
    { url: baseUrl + '/businesses', lastModified: staticLastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: baseUrl + '/checker', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/tools/whatsapp-link', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/nigerian-sme-report', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/whatsapp-business-nigeria', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/how-cloutinet-works', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: baseUrl + '/data/nigerian-cities-business-data', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/about', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/feedback', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: baseUrl + '/privacy', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.4 },
    { url: baseUrl + '/terms', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.4 },
    { url: baseUrl + '/auth', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]
}

function getCategoryPages(): MetadataRoute.Sitemap {
  return Object.keys(categoryMap).map((slug) => ({
    url: baseUrl + '/businesses/' + slug,
    lastModified: staticLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
}

// Supabase caps unpaginated selects at ~1000 rows by default. This walks the
// table in pages so growth past that cap can't silently drop URLs, and logs
// (rather than hides) any query failure.
const PAGE_SIZE = 1000

async function fetchAllRows<T>(
  runQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const rows: T[] = []
  let from = 0

  while (true) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await runQuery(from, to)

    if (error) {
      console.error('[sitemap] Supabase query failed:', error.message ?? error)
      break
    }
    if (!data || data.length === 0) break

    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return rows
}

async function getDynamicPages(): Promise<MetadataRoute.Sitemap> {
  const profiles = await fetchAllRows<{ business_slug: string; updated_at: string | null }>(
    (from, to) =>
      supabase
        .from('profiles')
        .select('business_slug, updated_at')
        .not('business_slug', 'is', null)
        .range(from, to)
  )

  const storePages: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: baseUrl + '/store/' + p.business_slug,
    lastModified: p.updated_at ? new Date(p.updated_at) : staticLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const products = await fetchAllRows<{
    slug: string
    updated_at: string | null
    profiles: { business_slug: string } | null
  }>((from, to) =>
    supabase
      .from('products')
      .select('slug, updated_at, profiles(business_slug)')
      .eq('is_published', true)
      .range(from, to)
  )

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.profiles?.business_slug)
    .map((p) => ({
      url: baseUrl + '/store/' + p.profiles!.business_slug + '/' + p.slug,
      lastModified: p.updated_at ? new Date(p.updated_at) : staticLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...storePages, ...productPages]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicPages = await getDynamicPages()
  return [...getStaticPages(), ...getCategoryPages(), ...dynamicPages]
}
