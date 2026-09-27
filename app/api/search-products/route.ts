import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

const STOPWORDS = new Set(['in', 'a', 'the', 'for', 'of', 'and', 'near', 'me', 'at', 'to'])

const categoryMap: Record<string, string> = {
  'food-groceries': 'Food & Groceries', 'fashion-clothing': 'Fashion & Clothing',
  'electronics-gadgets': 'Electronics & Gadgets', 'furniture-interior': 'Furniture & Interior',
  'building-materials': 'Building Materials', 'supermarket-store': 'Supermarket & Store',
  'wholesale-distribution': 'Wholesale & Distribution', 'salon-hair': 'Salon & Hair',
  'barber-shop': 'Barber Shop', 'spa-massage': 'Spa & Massage',
  'cosmetics-skincare': 'Cosmetics & Skincare', 'gym-fitness': 'Gym & Fitness',
  'restaurant-eatery': 'Restaurant & Eatery', 'fast-food-snacks': 'Fast Food & Snacks',
  'catering-services': 'Catering Services', 'bakery-pastry': 'Bakery & Pastry',
  'bar-drinks': 'Bar & Drinks', 'logistics-delivery': 'Logistics & Delivery',
  'printing-graphics': 'Printing & Graphics', 'photography-video': 'Photography & Video',
  'event-planning': 'Event Planning', 'cleaning-services': 'Cleaning Services',
  'security-services': 'Security Services', 'laundry-dry-cleaning': 'Laundry & Dry Cleaning',
  'tailoring-fashion-design': 'Tailoring & Fashion Design', 'shoe-making-repair': 'Shoe Making & Repair',
  'pharmacy-chemist': 'Pharmacy & Chemist', 'hospital-clinic': 'Hospital & Clinic',
  'optical-services': 'Optical Services', 'dental-care': 'Dental Care',
  'herbal-natural-health': 'Herbal & Natural Health', 'real-estate-property': 'Real Estate & Property',
  'architecture-design': 'Architecture & Design', 'plumbing-electrical': 'Plumbing & Electrical',
  'building-construction': 'Building & Construction', 'paint-finishing': 'Paint & Finishing',
  'school-tutorial': 'School & Tutorial', 'church-ministry': 'Church & Ministry',
  'mosque-islamic-center': 'Mosque & Islamic Center', 'skills-training': 'Skills & Training',
  'tech-it-services': 'Tech & IT Services', 'phone-repair': 'Phone Repair',
  'computer-services': 'Computer Services', 'digital-marketing': 'Digital Marketing',
  'farming-agriculture': 'Farming & Agriculture', 'livestock-poultry': 'Livestock & Poultry',
  'fish-farming': 'Fish Farming', 'crop-production': 'Crop Production',
  'car-sales': 'Car Sales', 'auto-repair-mechanic': 'Auto Repair & Mechanic',
  'spare-parts': 'Spare Parts', 'car-wash-detailing': 'Car Wash & Detailing',
  'financial-services': 'Financial Services', 'insurance': 'Insurance',
  'pos-mobile-money': 'POS & Mobile Money', 'other': 'Other',
}

const cityMap: Record<string, string> = {
  'lagos': 'Lagos', 'abuja': 'Abuja', 'port-harcourt': 'Port Harcourt', 'kano': 'Kano',
  'ibadan': 'Ibadan', 'benin-city': 'Benin City', 'enugu': 'Enugu', 'owerri': 'Owerri',
  'warri': 'Warri', 'kaduna': 'Kaduna', 'makurdi': 'Makurdi', 'jos': 'Jos',
  'calabar': 'Calabar', 'uyo': 'Uyo', 'asaba': 'Asaba', 'ilorin': 'Ilorin',
  'abeokuta': 'Abeokuta', 'akure': 'Akure', 'awka': 'Awka', 'umuahia': 'Umuahia',
}

function tokenize(q: string) {
  return q.toLowerCase().split(/\s+/).filter(t => t.length > 1 && !STOPWORDS.has(t))
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || ''
  if (!query.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const lowerQuery = query.toLowerCase()

  const cityMatch = Object.entries(cityMap)
    .sort((a, b) => b[1].length - a[1].length)
    .find(([, name]) => lowerQuery.includes(name.toLowerCase()))

  const queryWithoutCity = cityMatch
    ? lowerQuery.replace(cityMatch[1].toLowerCase(), '').trim()
    : lowerQuery

  const categoryMatch = Object.entries(categoryMap).find(([, name]) => {
    const parts = name.toLowerCase().split(' & ')
    return parts.some(p => p.length > 3 && queryWithoutCity === p)
  })

  let productsQuery = supabase
    .from('products')
    .select('id, name, description, price, currency, image_url, slug, user_id, profiles!inner(business_slug, business_name, location, business_category)')
    .eq('is_published', true)

  if (cityMatch) {
    productsQuery = productsQuery.ilike('profiles.location', '%' + cityMatch[1] + '%')
  }

  if (categoryMatch) {
    const { data } = await productsQuery.eq('profiles.business_category', categoryMatch[1]).limit(40)
    return NextResponse.json({ mode: 'broad', category: categoryMatch[1], results: data || [] })
  }

  const tokens = tokenize(queryWithoutCity)
  if (tokens.length === 0) {
    return NextResponse.json({ mode: 'specific', results: [] })
  }

  const orFilter = tokens.map(t => `name.ilike.%${t}%,description.ilike.%${t}%`).join(',')
  const { data: candidates, error } = await productsQuery.or(orFilter).limit(200)

  if (error) {
    console.error('search-products query failed:', error.message)
    return NextResponse.json({ mode: 'specific', results: [], error: error.message })
  }

  const normalizedQuery = queryWithoutCity.trim()

  const scored = (candidates || []).map((p: any) => {
    const name = (p.name || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()
    let score = 0

    if (name === normalizedQuery) score = 100
    else if (tokens.every(t => name.includes(t))) score = 80
    else {
      const nameHits = tokens.filter(t => name.includes(t)).length
      const descHits = tokens.filter(t => desc.includes(t)).length
      if (nameHits > 0) score = 40 + (nameHits / tokens.length) * 30
      else if (descHits === tokens.length) score = 40
      else if (descHits > 0) score = 15 + (descHits / tokens.length) * 15
    }

    return { ...p, _score: score }
  })

  const results = scored
    .filter(p => p._score >= 40)
    .sort((a, b) => b._score - a._score)
    .slice(0, 30)

  return NextResponse.json({ mode: 'specific', results, query: normalizedQuery })
}
