import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const CMS_ROLES = ['owner', 'admin', 'editor'] as const
const ALLOWED_BUCKETS = new Set([
  'product-images',
  'website-assets',
  'brand-logos',
  'partner-client-logos',
  'product-documents',
])

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function requireApprovedStaff(
  req: Request,
): Promise<{ user: User; admin: SupabaseClient } | Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) return json({ error: 'Unauthorized' }, 401)

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: profile } = await admin
    .from('profiles')
    .select('role, approval_status')
    .eq('id', user.id)
    .maybeSingle()

  if (
    !profile ||
    profile.approval_status !== 'approved' ||
    !CMS_ROLES.includes(profile.role as (typeof CMS_ROLES)[number])
  ) {
    return json({ error: 'Forbidden' }, 403)
  }

  return { user, admin }
}

async function ensureBucket(admin: SupabaseClient, bucket: string) {
  const { data: existing } = await admin.storage.getBucket(bucket)
  if (existing) return
  const { error } = await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: 52_428_800 })
  if (error && !error.message.toLowerCase().includes('already')) {
    throw error
  }
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const auth = await requireApprovedStaff(req)
  if (auth instanceof Response) return auth

  const { admin } = auth
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = String(body.action ?? 'upload')
  const bucket = String(body.bucket ?? '')
  const path = String(body.path ?? '').replace(/^\/+/, '')

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return json({ error: 'Invalid storage bucket' }, 400)
  }
  if (!path) return json({ error: 'path is required' }, 400)

  try {
    await ensureBucket(admin, bucket)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Could not ensure storage bucket' }, 500)
  }

  if (action === 'delete') {
    const { error } = await admin.storage.from(bucket).remove([path])
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  const fileBase64 = String(body.file_base64 ?? '')
  const contentType = String(body.content_type ?? 'application/octet-stream')
  if (!fileBase64) return json({ error: 'file_base64 is required for upload' }, 400)

  let bytes: Uint8Array
  try {
    bytes = decodeBase64(fileBase64)
  } catch {
    return json({ error: 'Invalid file_base64' }, 400)
  }

  const { error: upErr } = await admin.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: true,
  })
  if (upErr) return json({ error: upErr.message }, 500)

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path)
  return json({ ok: true, path, public_url: pub.publicUrl })
})
