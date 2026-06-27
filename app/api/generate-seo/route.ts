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
      prompt = `Write a short SEO tagline for a Nigerian ${category} business called "${businessName}" in ${location || 'Nigeria'}. Maximum 15 words. Return only the tagline.`
    }

    if (type === 'services') {
      prompt = `List 8 services/products for a Nigerian ${category} business called "${businessName}" in ${location || 'Nigeria'}. Return as comma-separated list only.`
    }

    if (type === 'product_description') {
      prompt = `Write a 2-sentence SEO product description for "${productName}" sold by "${businessName || 'a Nigerian business'}" in ${location || 'Nigeria'}. Price: ${price ? currency + ' ' + price : 'contact for price'}. End with WhatsApp contact CTA. Return only the description.`
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message, details: data.error }, { status: 500 })
    }

    if (!data.candidates || data.candidates.length === 0) {
      return NextResponse.json({ error: 'No candidates returned', raw: data }, { status: 500 })
    }

    const result = data.candidates[0]?.content?.parts[0]?.text?.trim()

    if (!result) {
      return NextResponse.json({ error: 'Empty result', raw: data }, { status: 500 })
    }

    return NextResponse.json({ result })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
