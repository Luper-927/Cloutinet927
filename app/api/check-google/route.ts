import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const businessName = searchParams.get('name')
  const city = searchParams.get('city') || 'Nigeria'

  if (!businessName) {
    return NextResponse.json({ error: 'Business name required' }, { status: 400 })
  }

  try {
    const query = encodeURIComponent(businessName + ' ' + city)
    const apiKey = process.env.SERPAPI_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const url = 'https://serpapi.com/search.json?engine=google&q=' + query + '&api_key=' + apiKey + '&gl=ng&hl=en'

    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ found: false, googleScore: 0, business: null })
    }

    const kg = data.knowledge_graph
    const local = data.local_results && data.local_results[0]
    const place = kg || local

    if (!place) {
      return NextResponse.json({ found: false, googleScore: 0, business: null })
    }

    let score = 0
    const breakdown: Record<string, boolean> = {}

    breakdown.name = !!(place.title || place.name)
    breakdown.address = !!place.address
    breakdown.phone = !!place.phone
    breakdown.hours = !!(place.hours || place.opening_hours)
    breakdown.website = !!place.website
    breakdown.rating = !!place.rating
    breakdown.reviews = typeof place.reviews === 'number' || typeof place.review_count === 'number'
    breakdown.photos = !!(place.image || place.thumbnail)
    breakdown.category = !!(place.type || place.category)

    if (breakdown.name) score += 15
    if (breakdown.address) score += 15
    if (breakdown.phone) score += 15
    if (breakdown.hours) score += 10
    if (breakdown.website) score += 10
    if (breakdown.rating) score += 10
    if (breakdown.reviews) score += 10
    if (breakdown.photos) score += 10
    if (breakdown.category) score += 5

    const reviewCount = typeof place.reviews === 'number'
      ? place.reviews
      : typeof place.review_count === 'number'
      ? place.review_count
      : null

    return NextResponse.json({
      found: true,
      googleScore: score,
      breakdown,
      business: {
        name: place.title || place.name || null,
        address: place.address || null,
        phone: place.phone || null,
        rating: place.rating || null,
        reviewCount,
        website: place.website || null,
        hours: place.hours || place.opening_hours || null,
        hasPhotos: breakdown.photos,
        type: place.type || place.category || null,
      }
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
