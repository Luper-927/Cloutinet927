// app/robots.ts — now async, lists every sitemap chunk that actually exists
import { MetadataRoute } from 'next'
import { getProfileCount, getProductCount, SITEMAP_CHUNK_SIZE } from '../lib/sitemap-helpers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const disallow = ['/dashboard', '/auth', '/api']

  const [profileCount, productCount] = await Promise.all([getProfileCount(), getProductCount()])
  const storeChunks = Math.max(1, Math.ceil(profileCount / SITEMAP_CHUNK_SIZE))
  const productChunks = Math.max(1, Math.ceil(productCount / SITEMAP_CHUNK_SIZE))

  const sitemap = [
    'https://cloutinet.online/sitemap.xml',
    ...Array.from({ length: storeChunks }, (_, i) => `https://cloutinet.online/store-sitemap/sitemap/${i}.xml`),
    ...Array.from({ length: productChunks }, (_, i) => `https://cloutinet.online/product-sitemap/sitemap/${i}.xml`),
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: 'GPTBot', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
      { userAgent: 'anthropic-ai', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow },
    ],
    sitemap,
  }
}
