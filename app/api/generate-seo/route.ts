import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getBusinessTier, TIER_LIMITS } from '@/lib/tiers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // 1. Require a logged-in user (this route had no auth check at all before)
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const callerId = userData.user.id

    // 2. Work out which business this generation counts against.
    //    Either the caller IS the business owner, or they're an active
    //    employee with "products" permission acting on the owner's behalf.
    let ownerId: string | null = null

    const { data: ownProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', callerId)
      .maybeSingle()

    if (ownProfile) {
      ownerId = callerId
    } else {
      const { data: employeeRow } = await supabase
        .from('employees')
        .select('owner_id, status, permissions')
        .eq('user_id', callerId)
        .eq('status', 'active')
        .maybeSingle()

      if (employeeRow && employeeRow.permissions?.products) {
        ownerId = employeeRow.owner_id
      }
    }

    if (!ownerId) {
      return NextResponse.json({ error: 'Not authorized for this business' }, { status: 403 })
    }

    // 3. Check + increment the monthly AI generation count for this business's tier.
    const tier = await getBusinessTier(ownerId)
    const limit = TIER_LIMITS[tier].aiGenerations

    const { data: usageResult, error: usageError } = await supabase.rpc('increment_ai_usage', {
      p_owner_id: ownerId,
      p_limit: limit,
    })

    if (usageError) {
      return NextResponse.json({ error: 'Could not check AI usage' }, { status: 500 })
    }
    if (!usageResult?.allowed) {
      return NextResponse.json(
        { error: `Monthly AI generation limit reached (${limit}/month on your plan). Upgrade for more.` },
        { status: 429 }
      )
    }

    // 4. Everything below this line is your original generation logic, unchanged.
    const body = await req.json()
    const { type, businessName, category, location, productName, price, currency } = body

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let prompt = ''

    if (type === 'tagline') {
      prompt = `Write a short SEO tagline for a Nigerian ${category} business called "${businessName}" in ${location || 'Nigeria'}. Maximum 15 words. Do not include any phone number. Return only the tagline, nothing else.`
    }

    if (type === 'services') {
      prompt = `List 8 specific services or products for a Nigerian ${category} business called "${businessName}" in ${location || 'Nigeria'}. Return as comma-separated list only, nothing else.`
    }

    if (type === 'product_description') {
      prompt = `Write a compelling, high-converting product description for "${productName}" sold by "${businessName || 'a Nigerian business'}" in ${location || 'Nigeria'}. Price: ${price ? currency + ' ' + price : 'contact for price'}.

Write 3-4 sentences that:
- Open with a strong hook about the product's main benefit or quality
- Highlight what makes it desirable (materials, craftsmanship, durability, style — infer from the product name/category if not given)
- Create urgency or desire without being pushy
- End by directing customers to contact via WhatsApp to order

Write like a premium retailer would — confident, specific, and persuasive. Avoid generic phrases like "upgrade your home" or "look no further." Do not include any phone number. Return only the description, nothing else.`
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
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
