export const metadata = {
  title: 'How Cloutinet Works: Technical Architecture 2026 | Cloutinet',
  description: 'Technical documentation of Cloutinet platform architecture, SEO implementation, JSON-LD schema structure, and programmatic page generation for Nigerian businesses.',
}

export default function HowCloutinetWorks() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: '800px', margin: '0 auto', padding: '40px 20px', background: '#fff', color: '#1a1a2e', lineHeight: 1.8 }}>

      <a href="/data" style={{ color: '#6B21A8', fontSize: '13px' }}>← Back to Data Repository</a>

      <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '24px 0 8px' }}>How Cloutinet Works: Technical Architecture</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '32px' }}>Technical Documentation | Cloutinet Platform | June 2026</p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        name: 'Cloutinet Technical Architecture 2026',
        description: 'Technical documentation of Cloutinet SEO platform for Nigerian businesses',
        datePublished: '2026-06-01',
        publisher: { '@type': 'Organization', name: 'Cloutinet', url: 'https://cloutinet.online' },
        keywords: 'Cloutinet architecture, Nigerian business SEO platform, programmatic SEO Nigeria, Next.js business directory',
      }) }} />

      <h2>Platform Overview</h2>
      <p>Cloutinet is a programmatic SEO platform built specifically for Nigerian small businesses. It automatically generates Google-indexed pages for every business and product listed on the platform, enabling businesses with zero technical knowledge to achieve Google visibility within 24-72 hours of signup.</p>

      <h2>Technology Stack</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
        <thead>
          <tr style={{ background: '#f9f5ff' }}>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Layer</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Technology</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Frontend', 'Next.js 14.2', 'Server-side rendered pages for instant Google indexing'],
            ['Database', 'Supabase PostgreSQL', 'Business profiles, products, analytics'],
            ['Image Storage', 'Supabase Storage', 'Product images with public CDN URLs'],
            ['Hosting', 'Vercel Edge Network', 'Global CDN, automatic SSL, instant deployments'],
            ['Domain', 'cloutinet.online', 'Custom domain with Vercel DNS'],
            ['Email', 'Resend', 'Transactional emails via cloutinet.online domain'],
            ['Analytics', 'Custom (Supabase)', 'Page views, WhatsApp lead clicks per business'],
          ].map(([layer, tech, purpose]) => (
            <tr key={layer}>
              <td style={{ padding: '10px', border: '1px solid #eee', fontWeight: 700 }}>{layer}</td>
              <td style={{ padding: '10px', border: '1px solid #eee' }}>{tech}</td>
              <td style={{ padding: '10px', border: '1px solid #eee' }}>{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>URL Structure</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
        <thead>
          <tr style={{ background: '#f9f5ff' }}>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>URL Pattern</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>Purpose</th>
            <th style={{ padding: '10px', border: '1px solid #e5d5ff', textAlign: 'left' }}>SEO Target</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['/store/[business-slug]', 'Business store page', '[Business Name] in [City] | Category'],
            ['/store/[business-slug]/[product-slug]', 'Individual product page', '[Product] in [City] | [Business Name]'],
            ['/businesses', 'Business directory', 'Find businesses in Nigeria'],
            ['/businesses/[category]', 'Category directory', 'Best [Category] in Nigeria'],
            ['/data', 'Data repository', 'Nigerian SME data and research'],
            ['/research', 'Research hub', 'Nigerian business intelligence'],
          ].map(([url, purpose, seo]) => (
            <tr key={url}>
              <td style={{ padding: '10px', border: '1px solid #eee', fontFamily: 'monospace', fontSize: '12px' }}>{url}</td>
              <td style={{ padding: '10px', border: '1px solid #eee' }}>{purpose}</td>
              <td style={{ padding: '10px', border: '1px solid #eee', fontSize: '12px', color: '#6B21A8' }}>{seo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>JSON-LD Schema Implementation</h2>
      <p>Every page on Cloutinet automatically generates structured data markup. Product pages use the following schema structure:</p>
      <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', fontSize: '12px', overflow: 'auto' }}>
{`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[Product Description]",
  "image": "[Product Image URL]",
  "offers": {
    "@type": "Offer",
    "price": "[Price]",
    "priceCurrency": "NGN",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "LocalBusiness",
      "name": "[Business Name]",
      "address": "[Location]",
      "telephone": "[Phone]"
    }
  }
}`}
      </pre>

      <h2>Automatic SEO Title Generation</h2>
      <p>Product page titles are programmatically generated using this formula:</p>
      <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
{`SEO Title = [Product Name] + " in " + [City] + " | " + [Business Name]
Example: "Rice 50kg Bag in Port Harcourt | Mary's Foodstuff Store"`}
      </pre>

      <h2>Sitemap Generation</h2>
      <p>Cloutinet generates a dynamic XML sitemap that automatically includes every new business and product page within minutes of creation. This sitemap is submitted to Google Search Console for immediate crawling.</p>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f9f5ff', borderRadius: '10px' }}>
        <p style={{ fontSize: '12px', color: '#888' }}>Documentation: Cloutinet (2026). Technical Architecture. cloutinet.online/data/how-cloutinet-works. Open documentation.</p>
      </div>

    </div>
  )
}
