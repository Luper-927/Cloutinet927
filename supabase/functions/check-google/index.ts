import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { searchParams } = new URL(req.url)
  const businessName = searchParams.get('name')
  const city = searchParams.get('city') || 'Nigeria'

  if (!businessName) {
    return new Response(
      JSON.stringify({ error: 'Business name required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const apiKey = Deno.env.get('SERPAPI_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
      return new Response(
        JSON.stringify({ found: false, googleScore: 0, business: null, onCloutinetSearch }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

    return new Response(
      JSON.stringify({
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
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
