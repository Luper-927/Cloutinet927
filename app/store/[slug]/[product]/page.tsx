import { supabase } from '../../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

async function getProductData(businessSlug: string, productSlug: string) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('business_slug', businessSlug)
    .limit(1)

  const profile = profiles && profiles[0]
  if (!profile) return null

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', productSlug)
    .eq('is_published', true)
    .limit(1)

  const product = products && products[0]
  if (!product) return null

  const { data: otherProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, currency, image_url')
    .eq('user_id', profile.id)
    .eq('is_published', true)
    .neq('id', product.id)
    .limit(4)

  await supabase.from('analytics_events').insert({
    event_type: 'page_view',
    business_slug: businessSlug,
    product_id: product.id,
    source: 'product_page',
  })

  return { profile, product, otherProducts: otherProducts || [] }
}

export async function generateMetadata({ params }: { params: { slug: string; product: string } }) {
  const data = await getProductData(params.slug, params.product)
  if (!data) return { title: 'Product Not Found | Cloutinet' }

  return {
    title: data.product.seo_title || (data.product.name + ' | ' + data.profile.business_name),
    description: data.product.seo_description || data.product.description,
  }
}

export default async function ProductPage({ params }: { params: { slug: string; product: string } }) {
  const data = await getProductData(params.slug, params.product)
  if (!data) return notFound()

  const { profile, product, otherProducts } = data

  const currencyMap: Record<string, string> = { NGN: 'NGN', USD: 'USD', GBP: 'GBP', EUR: 'EUR', GHS: 'GHS' }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.seo_description,
    image: product.image_url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: currencyMap[product.currency] || 'NGN',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'LocalBusiness',
        name: profile.business_name,
        address: profile.location,
        telephone: profile.phone,
      }
    }
  }

  const whatsappLink = profile.phone
    ? 'https://wa.me/' + profile.phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent('Hello, I saw your listing for ' + product.name + ' on Cloutinet and I want to buy it. Is it still available?')
    : null

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </Link>
        <Link href={'/store/' + params.slug} style={{ color: '#6B21A8', fontSize: '13px', textDecoration: 'none' }}>View Store →</Link>
      </nav>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>

        {product.image_url && (
          <img src={product.image_url} style={{ width: '100%', borderRadius: '14px', marginBottom: '16px', maxHeight: '280px', objectFit: 'cover' }} />
        )}

        <div style={{ color: '#6B21A8', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
          {profile.business_category || 'PRODUCT'} {profile.location && '· 📍 ' + profile.location}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>{product.name}</h1>

        {product.price && (
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#6B21A8', marginBottom: '12px' }}>
            {product.currency} {Number(product.price).toLocaleString()}
          </div>
        )}

        {product.description && (
          <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{product.description}</p>
        )}

        {whatsappLink && (
          <a href={whatsappLink} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#25D366', color: '#fff', padding: '14px',
            borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, marginBottom: '20px'
          }}>💬 Contact Seller on WhatsApp</a>
        )}

        <div style={{ background: '#f9f5ff', border: '1px solid #e5d5ff', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{profile.business_name}</div>
          {profile.tagline && <div style={{ color: '#888', fontSize: '12px' }}>{profile.tagline}</div>}
        </div>

        {otherProducts.length > 0 && (
          <>
            <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>More from {profile.business_name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {otherProducts.map((p: any) => (
                <Link key={p.id} href={'/store/' + params.slug + '/' + p.slug} style={{ textDecoration: 'none', color: '#1a1a2e', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
                  {p.image_url && <img src={p.image_url} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />}
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{p.name}</div>
                    {p.price && <div style={{ fontSize: '11px', color: '#6B21A8' }}>{p.currency} {Number(p.price).toLocaleString()}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>

      <footer style={{ background: '#f9f5ff', padding: '24px', textAlign: 'center', borderTop: '1px solid #e5d5ff' }}>
        <div style={{ fontSize: '13px', color: '#6B21A8', marginBottom: '8px' }}>📦 Is your business visible on Google?</div>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>This page was automatically generated by Cloutinet.</p>
        <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Create Your Own Free Page →</Link>
      </footer>
    </div>
  )
}
