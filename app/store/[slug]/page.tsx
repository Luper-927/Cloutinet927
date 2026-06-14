export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getStoreData(params.slug)
  if (!data) return { title: 'Business Not Found | Cloutinet' }

  const { profile, products } = data

  const title = profile.business_name + (profile.business_category ? ' - ' + profile.business_category : '') + (profile.location ? ' in ' + profile.location : '') + ' | Cloutinet'
  const description = profile.tagline
    ? profile.tagline + (profile.location ? ' Located in ' + profile.location + '.' : '') + ' Contact us on WhatsApp.'
    : 'Find ' + profile.business_name + (profile.business_category ? ', a ' + profile.business_category.toLowerCase() : ' business') + (profile.location ? ' in ' + profile.location : '') + '. Browse products and contact us on WhatsApp.'

  const image = products && products[0] && products[0].image_url ? products[0].image_url : undefined

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: image ? [image] : undefined,
    },
  }
}
