import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const businessName = searchParams.get('name')
  const city = searchParams.get('city') || 'Nigeria'

  if (!businessName) {
    return NextResponse.json({ error: 'Business name required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.SERPAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const query = encodeURIComponent(businessName + ' ' + city)

    const googleUrl = 'https://serpapi.com/search.json?engine=google&q=' + query + '&api_key=' + apiKey + '&gl=ng&hl=en'
    const mapsUrl = 'https://serpapi.com/search.json?engine=google_maps&q=' + query + '&api_key=' + apiKey + '&type=search&hl=en'

    const [googleRes, mapsRes] = await Promise.all([
      fetch(googleUrl),
      fetch(mapsUrl),
    ])
    const googleData = await googleRes.json()
    const mapsData = await mapsRes.json()

    const organicResults = googleData.organic_results || []
    const onCloutinetSearch = organicResults.some((r: any) =>
      typeof r.link === 'string' && r.link.includes('cloutinet.online')
    )

    const place = mapsData.place_results || (mapsData.local_results && mapsData.local_results[0])

    if (!place) {
      return NextResponse.json({ found: false, googleScore: 0, business: null, onCloutinetSearch })
    }

    const breakdown: Record<string, boolean> = {}
    breakdown.name = !!place.title
    breakdown.address = !!place.address
    breakdown.phone = !!place.phone
    breakdown.hours = !!(place.operating_hours || place.hours)
    breakdown.website = !!place.website
    breakdown.rating = !!place.rating
    breakdown.reviews = typeof place.reviews === 'number'
    breakdown.photos = !!(place.thumbnail || (place.photos && place.photos.length))
    breakdown.category = !!(place.type || (place.types && place.types.length))

    let score = 0
    if (breakdown.name) score += 15
    if (breakdown.address) score += 15
    if (breakdown.phone) score += 15
    if (breakdown.hours) score += 10
    if (breakdown.website) score += 10
    if (breakdown.rating) score += 10
    if (breakdown.reviews) score += 10
    if (breakdown.photos) score += 10
    if (breakdown.category) score += 5

    return NextResponse.json({
      found: true,
      googleScore: score,
      breakdown,
      onCloutinetSearch,
      business: {
        name: place.title || null,
        address: place.address || null,
        phone: place.phone || null,
        rating: place.rating || null,
        reviewCount: typeof place.reviews === 'number' ? place.reviews : null,
        website: place.website || null,
        hours: place.operating_hours || place.hours || null,
        hasPhotos: breakdown.photos,
        type: place.type || (place.types && place.types[0]) || null,
      }
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
