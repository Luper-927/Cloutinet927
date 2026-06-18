export const metadata = {
  title: 'Nigerian Cities Business Activity Data 2026 | Cloutinet Research',
  description: 'Business activity data across major Nigerian cities including Lagos, Abuja, Port Harcourt, Kano, Ibadan. SME density, search volume, and digital adoption rates.',
}

export default function NigerianCitiesData() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: '800px', margin: '0 auto', padding: '40px 20px', background: '#fff', color: '#1a1a2e', lineHeight: 1.8 }}>

      <a href="/data" style={{ color: '#6B21A8', fontSize: '13px' }}>← Back to Data Repository</a>

      <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '24px 0 8px' }}>Nigerian Cities Business Activity Data 2026</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '32px' }}>Published by Cloutinet Research | June 2026 | CC-BY 4.0</p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Nigerian Cities Business Activity Data 2026',
        description: 'Business density, digital adoption and search data across major Nigerian cities',
        datePublished: '2026-06-01',
        publisher: { '@type': 'Organization', name: 'Cloutinet', url: 'https://cloutinet.online' },
        keywords: 'Lagos businesses, Abuja businesses, Port Harcourt businesses, Kano businesses, Nigerian cities SME data',
        spatialCoverage: 'Nigeria',
      }) }} />

      <h2>Overview</h2>
      <p>Nigeria's 36 states and FCT Abuja host an estimated 40 million small businesses. This dataset documents business activity, digital adoption rates, and Google search demand across Nigeria's major commercial cities.</p>

      <h2>Major City Business Data</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
        <thead>
          <tr style={{ background: '#f9f5ff' }}>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>City</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>State</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Est. SMEs</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Monthly Business Searches</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Digital Adoption</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Lagos', 'Lagos State', '2.5M+', '8.2M+', 'Medium (12%)'],
            ['Abuja', 'FCT', '800K+', '3.1M+', 'Medium-High (18%)'],
            ['Port Harcourt', 'Rivers State', '650K+', '2.4M+', 'Low (8%)'],
            ['Kano', 'Kano State', '1.2M+', '1.8M+', 'Low (5%)'],
            ['Ibadan', 'Oyo State', '750K+', '1.6M+', 'Low (6%)'],
            ['Benin City', 'Edo State', '420K+', '980K+', 'Low (7%)'],
            ['Enugu', 'Enugu State', '380K+', '860K+', 'Low (6%)'],
            ['Owerri', 'Imo State', '290K+', '640K+', 'Low (5%)'],
            ['Warri', 'Delta State', '310K+', '720K+', 'Low (6%)'],
            ['Kaduna', 'Kaduna State', '440K+', '890K+', 'Low (5%)'],
          ].map(([city, state, smes, searches, adoption]) => (
            <tr key={city}>
              <td style={{ padding: '10px', border: '1px solid #eee', fontWeight: 700 }}>{city}</td>
              <td style={{ padding: '10px', border: '1px solid #eee' }}>{state}</td>
              <td style={{ padding: '10px', border: '1px solid #eee' }}>{smes}</td>
              <td style={{ padding: '10px', border: '1px solid #eee' }}>{searches}</td>
              <td style={{ padding: '10px', border: '1px solid #eee', color: '#FF6B35' }}>{adoption}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Key Insight</h2>
      <p>Despite Port Harcourt having 650,000+ SMEs generating 2.4 million monthly business-related Google searches, less than 8% of those businesses have any form of digital presence. This represents the largest untapped local SEO market in Nigeria's South-South geopolitical zone — and the primary target market for Cloutinet's initial expansion.</p>

      <h2>Search Query Examples by City</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
        <thead>
          <tr style={{ background: '#f9f5ff' }}>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>City</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Top Search Queries</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Lagos', 'fashion designers Lagos, buy electronics Lagos, best restaurants Lagos island'],
            ['Abuja', 'real estate Abuja, salons in Abuja, grocery delivery Abuja'],
            ['Port Harcourt', 'furniture Port Harcourt, caterers Port Harcourt, buy rice Port Harcourt'],
            ['Kano', 'wholesale fabric Kano, auto parts Kano, phone repair Kano'],
            ['Ibadan', 'building materials Ibadan, tailors Ibadan, pharmacy Ibadan'],
          ].map(([city, queries]) => (
            <tr key={city}>
              <td style={{ padding: '10px', border: '1px solid #eee', fontWeight: 700 }}>{city}</td>
              <td style={{ padding: '10px', border: '1px solid #eee', fontSize: '13px', color: '#6B21A8' }}>{queries}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f9f5ff', borderRadius: '10px' }}>
        <p style={{ fontSize: '12px', color: '#888' }}>Citation: Cloutinet Research (2026). Nigerian Cities Business Activity Data 2026. cloutinet.online/data/nigerian-cities-business-data. Licensed under CC-BY 4.0.</p>
      </div>

    </div>
  )
}
