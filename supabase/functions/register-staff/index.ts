import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const fullName = String(body.full_name ?? '').trim()

  if (!email || !password || password.length < 8 || !fullName) {
    return new Response(
      JSON.stringify({ error: 'Name, valid email, and password (min 8 characters) are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, registration_source: 'self-serve' },
  })

  if (createError) {
    const message = createError.message.includes('already')
      ? 'An account with this email already exists'
      : createError.message
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userId = created.user?.id
  if (userId) {
    await admin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      email,
      role: 'editor',
      approval_status: 'pending',
    })
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: 'Registration submitted. An administrator must approve your account before you can sign in.',
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
