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
    const apiKey = 'e033b817802fc471ded34fb7679d0dac67d0bdc3df705a4b21eab8ceadfaec08

    const response = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${query}&api_key=${apiKey}&gl=ng&hl=en`
    )

    const data = await response.json()

    const kg = data.knowledge_graph
    const localResults = data.local_results

    if (!kg && (!localResults || localResults.length === 0)) {
      return NextResponse.json({
        found: false,
        googleScore: 0,
        business: null,
      })
    }

    const place = kg || (localResults && localResults[0])

    let googleScore = 0
    const breakdown: any = {}

    if (place.title || place.name) { googleScore += 15; breakdown.name = true } else { breakdown.name = false }
    if (place.address) { googleScore += 15; breakdown.address = true } else { breakdown.address = false }
    if (place.phone) { googleScore += 15; breakdown.phone = true } else { breakdown.phone = false }
    if (place.hours || place.opening_hours) { googleScore += 10; breakdown.hours = true } else { breakdown.hours = false }
    if (place.website) { googleScore += 10; breakdown.website = true } else { breakdown.website = false }
    if (place.rating) { googleScore += 10; breakdown.rating = true } else { breakdown.rating = false }
    if (place.reviews || place.user_ratings_total) { googleScore += 10; breakdown.reviews = true } else { breakdown.reviews = false }
    if (place.image || place.thumbnail || place.images) { googleScore += 10; breakdown.photos = true } else { breakdown.photos = false }
    if (place.type || place.types || place.category) { googleScore += 5; breakdown.verified = true } else { breakdown.verified = false }

    return NextResponse.json({
      found: true,
      googleScore,
      breakdown,
      business: {
        name: place.title || place.name,
        address: place.address,
        phone: place.phone,
        rating: place.rating,
        reviewCount: place.reviews || place.user_ratings_total,
        website: place.website,
        hours: place.hours || place.opening_hours,
        hasPhotos: !!(place.image || place.thumbnail),
        type: place.type || place.category,
      }
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
