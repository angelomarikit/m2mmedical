import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function generateReference() {
  const part = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `M2M-${part}`
}

async function checkRateLimit(supabase: ReturnType<typeof createClient>, bucket: string, max = 5, windowMinutes = 60) {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString()
  const { count } = await supabase
    .from('submission_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('bucket_key', bucket)
    .gte('created_at', since)
  if ((count ?? 0) >= max) return false
  await supabase.from('submission_rate_limits').insert({ bucket_key: bucket })
  return true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(url, serviceKey)

  let body: Record<string, unknown>
  try {
    const text = await req.text()
    if (text.length > 20_000) return json(413, { error: 'Payload too large' })
    body = JSON.parse(text)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  if (body.website) return json(400, { error: 'Spam detected' })
  if (body.privacy_consent !== true) return json(400, { error: 'Privacy consent required' })

  const email = String(body.email ?? '').toLowerCase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ok = await checkRateLimit(supabase, `inquiry:${ip}`, 8)
  const okEmail = await checkRateLimit(supabase, `inquiry:${email}`, 5)
  if (!ok || !okEmail) return json(429, { error: 'Too many requests. Please try again later.' })

  const items = body.items as Array<Record<string, unknown>>
  if (!Array.isArray(items) || items.length === 0) return json(400, { error: 'At least one product required' })

  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('id, status')
      .eq('id', item.product_id)
      .maybeSingle()
    if (!product || product.status !== 'published') {
      return json(400, { error: 'Invalid product in request' })
    }
  }

  const public_reference = generateReference()
  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .insert({
      public_reference,
      inquiry_type: body.inquiry_type,
      full_name: body.full_name,
      company_name: body.company_name,
      email: body.email,
      phone: body.phone,
      location: body.location ?? null,
      message: body.message ?? null,
      requested_delivery_date: body.requested_delivery_date ?? null,
      privacy_consent_at: new Date().toISOString(),
      status: 'new',
    })
    .select('id')
    .single()

  if (error || !inquiry) return json(500, { error: error?.message ?? 'Insert failed' })

  const rows = items.map((item) => ({
    inquiry_id: inquiry.id,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    model_snapshot: item.model_snapshot ?? null,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase.from('inquiry_items').insert(rows)
  if (itemsError) return json(500, { error: itemsError.message })

  return json(200, { public_reference })
})
