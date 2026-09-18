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
      return NextResponse.json({ error: 'API key not configured', debug: 'NO_KEY' }, { status: 500 })
    }

    const url = 'https://serpapi.com/search.json?engine=google&q=' + query + '&api_key=' + apiKey + '&gl=ng&hl=en'

    const response = await fetch(url)
    const data = await response.json()

    // TEMPORARY DEBUG: return the raw shape of what SerpAPI sent back
    return NextResponse.json({
      _debug: {
        httpStatus: response.status,
        serpApiError: data.error || null,
        hasKnowledgeGraph: !!data.knowledge_graph,
        knowledgeGraphKeys: data.knowledge_graph ? Object.keys(data.knowledge_graph) : null,
        hasLocalResults: !!(data.local_results && data.local_results.length),
        localResultsCount: data.local_results ? data.local_results.length : 0,
        firstLocalResultKeys: data.local_results && data.local_results[0] ? Object.keys(data.local_results[0]) : null,
        firstLocalResultRaw: data.local_results && data.local_results[0] ? data.local_results[0] : null,
        topLevelKeys: Object.keys(data),
      }
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
