import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json()
  if (body.website) return new Response(JSON.stringify({ error: 'Spam detected' }), { status: 400, headers: corsHeaders })
  if (body.privacy_consent !== true) {
    return new Response(JSON.stringify({ error: 'Privacy consent required' }), { status: 400, headers: corsHeaders })
  }

  const { data, error } = await supabase.from('contact_messages').insert({
    full_name: body.full_name,
    company_name: body.company_name,
    email: body.email,
    phone: body.phone,
    subject: body.subject,
    message: body.message,
    status: 'new',
  }).select('id').single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ id: data.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
