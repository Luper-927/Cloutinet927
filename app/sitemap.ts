import { MetadataRoute } from 'next'
import { supabase } from '../lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cloutinet.online'

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

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: baseUrl + '/businesses', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: baseUrl + '/checker', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/tools/whatsapp-link', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/nigerian-sme-report', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/whatsapp-business-nigeria', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/how-cloutinet-works', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: baseUrl + '/data/nigerian-cities-business-data', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/feedback', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: baseUrl + '/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: baseUrl + '/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: baseUrl + '/auth', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const categoryPages: MetadataRoute.Sitemap = Object.keys(categoryMap).map(slug => ({
    url: baseUrl + '/businesses/' + slug,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const { data: profiles } = await supabase
    .from('profiles')
    .select('business_slug')
    .not('business_slug', 'is', null)

  const storePages: MetadataRoute.Sitemap = (profiles || []).map((p: any) => ({
    url: baseUrl + '/store/' + p.business_slug,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const { data: products } = await supabase
    .from('products')
    .select('slug, profiles(business_slug)')
    .eq('is_published', true)

  const productPages: MetadataRoute.Sitemap = (products || [])
    .filter((p: any) => p.profiles?.business_slug)
    .map((p: any) => ({
      url: baseUrl + '/store/' + p.profiles.business_slug + '/' + p.slug,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...staticPages, ...categoryPages, ...storePages, ...productPages]
}
