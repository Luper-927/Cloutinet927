import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const TIER_LIMITS = {
  free: { aiGenerationsPerMonth: 10 },
  essential: { aiGenerationsPerMonth: 70 },
  growth: { aiGenerationsPerMonth: 180 },
  business: { aiGenerationsPerMonth: 600 },
  advanced: { aiGenerationsPerMonth: 2999 },
} as const

type TierKey = keyof typeof TIER_LIMITS

const PLAN_ID_TO_TIER: Record<string, TierKey> = {
  free: 'free',
  essential: 'essential',
  growth: 'growth',
  business: 'business',
  advanced: 'advanced',
}

async function getBusinessTier(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan_id, current_period_end, plans(id)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) {
    return { tierKey: 'free' as TierKey }
  }

  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return { tierKey: 'free' as TierKey }
  }

  const tierKey = PLAN_ID_TO_TIER[data.plan_id] || 'free'
  return { tierKey }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Require a logged-in user
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const callerId = userData.user.id

    // 2. Work out which business this generation counts against.
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
      return new Response(JSON.stringify({ error: 'Not authorized for this business' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Check + increment the monthly AI generation count for this business's tier.
    const tier = await getBusinessTier(ownerId)
    const limit = TIER_LIMITS[tier.tierKey].aiGenerationsPerMonth

    const { data: usageResult, error: usageError } = await supabase.rpc('increment_ai_usage', {
      p_owner_id: ownerId,
      p_limit: limit,
    })

    if (usageError) {
      console.error('increment_ai_usage error:', usageError)
      return new Response(JSON.stringify({ error: 'Could not check AI usage' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (!usageResult?.allowed) {
      return new Response(
        JSON.stringify({ error: `Monthly AI generation limit reached (${limit}/month on your plan). Upgrade for more.` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Generation logic
    const body = await req.json()
    const { type, businessName, category, location, productName, price, currency, campaignName, objective } = body

    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
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

    if (type === 'campaign_copy') {
      const target = productName
        ? `their product "${productName}"${price ? ' (priced at ' + currency + ' ' + price + ')' : ''}`
        : `their business`

      prompt = `Write a short, high-converting promotional marketing post for a Nigerian ${category || 'business'} called "${businessName || 'this business'}" in ${location || 'Nigeria'}.

Campaign name: "${campaignName || 'Untitled Campaign'}"
Campaign objective: "${objective || 'Build awareness'}"
Promoting: ${target}

Write 3-5 sentences suitable for posting on WhatsApp Status, Instagram, or Facebook that:
- Open with a scroll-stopping hook relevant to the objective above
- Speak directly to the customer's need or desire
- Build urgency or excitement without sounding desperate or spammy
- End with a natural call to action encouraging the reader to reach out

Write like a savvy Nigerian small business owner would — warm, confident, and persuasive, not corporate. Do not include any phone number, emojis in excess (max 1-2), or hashtags. Return only the post text, nothing else.`
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
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = data.choices?.[0]?.message?.content?.trim()

    if (!result) {
      return new Response(JSON.stringify({ error: 'No result generated' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
