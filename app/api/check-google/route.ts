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
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`
    )

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        found: false,
        googleScore: 0,
        business: null,
      })
    }

    const place = data.results[0]

    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,website,photos,business_status,types&key=${apiKey}`
    )

    const detailsData = await detailsResponse.json()
    const details = detailsData.result

    let googleScore = 0
    const breakdown: any = {}

    if (details.name) { googleScore += 15; breakdown.name = true } else { breakdown.name = false }
    if (details.formatted_address) { googleScore += 15; breakdown.address = true } else { breakdown.address = false }
    if (details.formatted_phone_number) { googleScore += 15; breakdown.phone = true } else { breakdown.phone = false }
    if (details.opening_hours) { googleScore += 10; breakdown.hours = true } else { breakdown.hours = false }
    if (details.website) { googleScore += 10; breakdown.website = true } else { breakdown.website = false }
    if (details.rating) { googleScore += 10; breakdown.rating = true } else { breakdown.rating = false }
    if (details.user_ratings_total > 0) { googleScore += 10; breakdown.reviews = true } else { breakdown.reviews = false }
    if (details.photos && details.photos.length > 0) { googleScore += 10; breakdown.photos = true } else { breakdown.photos = false }
    if (details.business_status === 'OPERATIONAL') { googleScore += 5; breakdown.verified = true } else { breakdown.verified = false }

    return NextResponse.json({
      found: true,
      googleScore,
      breakdown,
      business: {
        name: details.name,
        address: details.formatted_address,
        phone: details.formatted_phone_number,
        hours: details.opening_hours?.weekday_text || null,
        rating: details.rating,
        reviewCount: details.user_ratings_total,
        website: details.website,
        hasPhotos: !!(details.photos && details.photos.length > 0),
        status: details.business_status,
      }
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
