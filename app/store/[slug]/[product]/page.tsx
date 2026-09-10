import { supabase } from '../../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cache } from 'react'

export const revalidate = 60

const getProductData = cache(async (businessSlug: string, productSlug: string) => {
  const { data: profiles } = await supabase
    .from('profiles').select('*').eq('business_slug', businessSlug).limit(1)

  const profile = profiles && profiles[0]
  if (!profile) return null

  const { data: products } = await supabase
    .from('products').select('*')
    .eq('user_id', profile.id).eq('slug', productSlug).eq('is_published', true).limit(1)

  const product = products && products[0]
  if (!product) return null

  const { data: otherProducts } = await supabase
    .from('products').select('id, name, slug, price, currency, image_url')
    .eq('user_id', profile.id).eq('is_published', true).neq('id', product.id).limit(4)

  return { profile, product, otherProducts: otherProducts || [] }
})

function trackPageView(businessSlug: string, productId: string) {
  // Fire-and-forget: never block or fail page rendering because of analytics.
  supabase.from('analytics_events').insert({
    event_type: 'page_view',
    business_slug: businessSlug,
    product_id: productId,
    source: 'product_page',
  }).then(() => {}, () => {})
}

export async function generateMetadata({ params }: { params: { slug: string; product: string } }) {
  const data = await getProductData(params.slug, params.product)
  if (!data) return { title: 'Product Not Found | Cloutinet' }
  return {
    title: data.product.seo_title || (data.product.name + ' | ' + data.profile.business_name),
    description: data.product.seo_description || data.product.description,
    alternates: { canonical: '/store/' + params.slug + '/' + params.product },
  }
}

export default async function ProductPage({ params }: { params: { slug: string; product: string } }) {
  const data = await getProductData(params.slug, params.product)
  if (!data) return notFound()

  const { profile, product, otherProducts } = data

  trackPageView(params.slug, product.id)

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency === 'NGN' ? 'NGN' : product.currency === 'USD' ? 'USD' : product.currency === 'GBP' ? 'GBP' : 'NGN',
      availability: 'https://schema.org/InStock',
    }
  }
  if (product.description || product.seo_description) schema.description = product.description || product.seo_description
  if (product.image_url) schema.image = product.image_url
  const seller: any = { '@type': 'LocalBusiness', name: profile.business_name }
  if (profile.location) seller.address = profile.location
  if (profile.phone) seller.telephone = profile.phone
  schema.offers.seller = seller

  const whatsappLink = profile.phone
    ? 'https://wa.me/' + profile.phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent('Hello, I saw your listing for ' + product.name + ' on Cloutinet and I want to buy it. Is it still available?')
    : null

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href={'/store/' + params.slug} style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>View Store →</Link>
          <Link href="/auth" style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textDecoration: 'none', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 10px' }}>
            Get Your Free Page
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px' }}>

        {product.image_url && (
          <img src={product.image_url} style={{ width: '100%', borderRadius: '10px', marginBottom: '16px', maxHeight: '280px', objectFit: 'cover' }} />
        )}

        <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
          {profile.business_category || 'Product'} {profile.location && '· ' + profile.location}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#0F172A' }}>{product.name}</h1>

        {product.price && (
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
            {product.currency} {Number(product.price).toLocaleString()}
          </div>
        )}

        {product.description && (
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{product.description}</p>
        )}

        {whatsappLink && (
          <a href={whatsappLink} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#16A34A', color: '#fff', padding: '14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, marginBottom: '20px'
          }}>Contact Seller on WhatsApp</a>
        )}

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#0F172A' }}>{profile.business_name}</div>
          {profile.tagline && <div style={{ color: '#64748B', fontSize: '12px' }}>{profile.tagline}</div>}
        </div>

        {otherProducts.length > 0 && (
          <>
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: '#0F172A' }}>More from {profile.business_name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {otherProducts.map((p: any) => (
                <Link key={p.id} href={'/store/' + params.slug + '/' + p.slug} style={{ textDecoration: 'none', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  {p.image_url && <img src={p.image_url} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />}
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{p.name}</div>
                    {p.price && <div style={{ fontSize: '11px', color: '#475569' }}>{p.currency} {Number(p.price).toLocaleString()}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <footer style={{ background: '#0F172A', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '15px', color: '#fff', fontWeight: 800, marginBottom: '8px' }}>
          Want a page like this for your business?
        </div>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '18px', maxWidth: '360px', margin: '0 auto 18px' }}>
          {profile.business_name} built this Google-searchable page for free on Cloutinet. Yours takes about 5 minutes.
        </p>
        <Link href="/auth" style={{ display: 'inline-block', background: '#2563EB', color: '#fff', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
          Create Your Free Page →
        </Link>
      </footer>
    </div>
  )
}
