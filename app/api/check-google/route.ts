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

    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_maps&q=${query}&api_key=${apiKey}`
    )

    const data = await response.json()

    if (!data.local_results || data.local_results.length === 0) {
      return NextResponse.json({
        found: false,
        googleScore: 0,
        business: null,
      })
    }

    const place = data.local_results[0]

    let googleScore = 0
    const breakdown: any = {}

    if (place.title) { googleScore += 15; breakdown.name = true } else { breakdown.name = false }
    if (place.address) { googleScore += 15; breakdown.address = true } else { breakdown.address = false }
    if (place.phone) { googleScore += 15; breakdown.phone = true } else { breakdown.phone = false }
    if (place.hours) { googleScore += 10; breakdown.hours = true } else { breakdown.hours = false }
    if (place.website) { googleScore += 10; breakdown.website = true } else { breakdown.website = false }
    if (place.rating) { googleScore += 10; breakdown.rating = true } else { breakdown.rating = false }
    if (place.reviews) { googleScore += 10; breakdown.reviews = true } else { breakdown.reviews = false }
    if (place.thumbnail) { googleScore += 10; breakdown.photos = true } else { breakdown.photos = false }
    if (place.type) { googleScore += 5; breakdown.verified = true } else { breakdown.verified = false }

    return NextResponse.json({
      found: true,
      googleScore,
      breakdown,
      business: {
        name: place.title,
        address: place.address,
        phone: place.phone || null,
        rating: place.rating || null,
        reviewCount: place.reviews || null,
        website: place.website || null,
        hours: place.hours || null,
        hasPhotos: !!place.thumbnail,
        type: place.type || null,
      }
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
