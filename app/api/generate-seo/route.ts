import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, businessName, category, location, productName, price, currency } = body

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let prompt = ''

    if (type === 'tagline') {
      prompt = `Generate a short, SEO-optimized business tagline for a Nigerian business with these details:
Business Name: ${businessName}
Category: ${category}
Location: ${location || 'Nigeria'}

Requirements:
- Maximum 15 words
- Include the city/location if provided
- Include main service/product keywords
- Sound professional and trustworthy
- Help the business get found on Google
- Do not use quotes or punctuation at the end

Return only the tagline, nothing else.`
    }

    if (type === 'services') {
      prompt = `Generate a comma-separated list of 8-10 specific services or products for a Nigerian ${category} business called "${businessName}"${location ? ` in ${location}` : ''}.

Requirements:
- Be specific and realistic for Nigerian market
- Use keywords people actually search on Google
- Separate each item with a comma
- No bullet points, no numbering
- Return only the comma-separated list, nothing else`
    }

    if (type === 'product_description') {
      prompt = `Write a short, SEO-optimized product description for a Nigerian business listing with these details:
Product: ${productName}
Business: ${businessName || 'Nigerian business'}
Category: ${category || 'retail'}
Location: ${location || 'Nigeria'}
Price: ${price ? currency + ' ' + price : 'Contact for price'}

Requirements:
- Maximum 3 sentences
- Include product name, location, and WhatsApp contact mention
- Use keywords people search on Google
- Sound professional
- End with a call to action to contact on WhatsApp
- Return only the description, nothing else`
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        })
      }
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!result) {
      return NextResponse.json({ error: 'No result generated' }, { status: 500 })
    }

    return NextResponse.json({ result })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
