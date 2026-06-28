import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, businessName, category, location, productName, price, currency } = body

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let prompt = ''

    if (type === 'tagline') {
      prompt = `Write a short SEO tagline for a Nigerian ${category} business called "${businessName}" in ${location || 'Nigeria'}. Maximum 15 words. Return only the tagline, nothing else.`
    }

    if (type === 'services') {
      prompt = `List 8 specific services or products for a Nigerian ${category} business called "${businessName}" in ${location || 'Nigeria'}. Return as comma-separated list only, nothing else.`
    }

    if (type === 'product_description') {
      prompt = `Write a 2-sentence SEO product description for "${productName}" sold by "${businessName || 'a Nigerian business'}" in ${location || 'Nigeria'}. Price: ${price ? currency + ' ' + price : 'contact for price'}. End with a WhatsApp contact call to action. Return only the description, nothing else.`
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const result = data.choices?.[0]?.message?.content?.trim()

    if (!result) {
      return NextResponse.json({ error: 'No result generated' }, { status: 500 })
    }

    return NextResponse.json({ result })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
