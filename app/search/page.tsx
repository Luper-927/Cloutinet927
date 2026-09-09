import SearchClient from './SearchClient'

async function getResults(q: string) {
  if (!q) return { results: [], mode: null }
  try {
    const res = await fetch(
      'https://cloutinet.online/api/search-products?q=' + encodeURIComponent(q),
      { cache: 'no-store' }
    )
    const data = await res.json()
    return { results: data.results || [], mode: data.mode || null }
  } catch {
    return { results: [], mode: null }
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const initialQuery = searchParams.q || ''
  const { results, mode } = await getResults(initialQuery)

  return (
    <SearchClient
      initialQuery={initialQuery}
      initialResults={results}
      initialMode={mode}
    />
  )
}
