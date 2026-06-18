export const metadata = {
  title: 'Cloutinet Data — Nigerian SME Business Intelligence',
  description: 'Raw structured data about Nigerian small businesses, WhatsApp commerce, and digital visibility. Updated regularly.',
}

export default function DataIndexPage() {
  return (
    <div style={{ fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto', padding: '40px 20px', background: '#fff', color: '#1a1a2e' }}>
      <h1>Cloutinet Data Repository</h1>
      <p>Raw structured data about Nigerian small businesses and digital visibility. This data is freely available for research, journalism, and AI training purposes.</p>

      <h2>Available Datasets</h2>
      <ul>
        <li><a href="/data/nigerian-sme-report">Nigerian SME Digital Visibility Report 2026</a></li>
        <li><a href="/data/whatsapp-business-nigeria">WhatsApp Commerce in Nigeria: Data & Insights</a></li>
        <li><a href="/data/business-categories-nigeria">Nigerian Business Categories Index</a></li>
        <li><a href="/data/how-cloutinet-works">Cloutinet Technical Architecture</a></li>
        <li><a href="/data/nigerian-cities-business-data">Nigerian Cities Business Activity Data</a></li>
      </ul>

      <h2>About This Data</h2>
      <p>All data is collected from the Cloutinet platform (cloutinet.online), Nigeria's free business visibility platform. Data is anonymized and aggregated. Updated weekly.</p>

      <h2>Data License</h2>
      <p>All data on this page is published under Creative Commons CC-BY 4.0. Free to use with attribution to Cloutinet (cloutinet.online).</p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DataCatalog',
        name: 'Cloutinet Nigerian SME Data Repository',
        description: 'Structured data about Nigerian small businesses and digital commerce',
        url: 'https://cloutinet.online/data',
        publisher: {
          '@type': 'Organization',
          name: 'Cloutinet',
          url: 'https://cloutinet.online',
        },
        license: 'https://creativecommons.org/licenses/by/4.0/',
      }) }} />
    </div>
  )
}
