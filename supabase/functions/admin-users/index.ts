import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

type StaffRole = 'owner' | 'admin' | 'editor' | 'sales'
type ApprovalStatus = 'pending' | 'approved' | 'rejected'

const CMS_ROLES: StaffRole[] = ['owner', 'admin', 'editor']
const ALLOWED_ROLES: StaffRole[] = ['owner', 'admin', 'editor', 'sales']

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

function canManageUsers(role: StaffRole): boolean {
  return role === 'owner' || role === 'admin'
}

async function requireStaffUser(
  req: Request,
): Promise<{ user: User; role: StaffRole; admin: SupabaseClient } | Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()
  if (userError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role, approval_status')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile?.role) {
    return json({ error: 'Forbidden' }, 403)
  }

  const role = profile.role as StaffRole
  const approval = profile.approval_status as ApprovalStatus
  if (approval !== 'approved' || !CMS_ROLES.includes(role)) {
    return json({ error: 'Forbidden' }, 403)
  }

  return { user, role, admin }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const auth = await requireStaffUser(req)
  if (auth instanceof Response) return auth

  const { user: caller, role: callerRole, admin } = auth
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = String(body.action ?? '')

  if (action === 'list') {
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('id, full_name, role, approval_status, created_at')
      .order('created_at')
    if (profilesError) {
      return json({ error: profilesError.message }, 500)
    }

    const { data: authList, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 })
    if (listError) {
      return json({ error: listError.message }, 500)
    }

    const emailById = new Map(authList.users.map((u) => [u.id, u.email ?? '']))
    const users = (profiles ?? []).map((p) => ({
      id: p.id,
      email: emailById.get(p.id) ?? '',
      full_name: p.full_name,
      role: p.role,
      approval_status: p.approval_status,
      created_at: p.created_at,
      is_self: p.id === caller.id,
    }))

    return json({
      users,
      pending: users.filter((u) => u.approval_status === 'pending'),
      can_manage_users: canManageUsers(callerRole),
      can_change_roles: callerRole === 'owner',
    })
  }

  if (action === 'approve') {
    if (!canManageUsers(callerRole)) {
      return json({ error: 'Only owners and admins can approve registrations' }, 403)
    }
    const userId = String(body.user_id ?? '')
    const role = String(body.role ?? 'editor') as StaffRole
    if (!userId || !['admin', 'editor'].includes(role)) {
      return json({ error: 'user_id and role (admin or editor) required' }, 400)
    }
    const { error } = await admin
      .from('profiles')
      .update({ approval_status: 'approved', role })
      .eq('id', userId)
      .eq('approval_status', 'pending')
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  if (action === 'reject') {
    if (!canManageUsers(callerRole)) {
      return json({ error: 'Only owners and admins can reject registrations' }, 403)
    }
    const userId = String(body.user_id ?? '')
    if (!userId) return json({ error: 'user_id required' }, 400)
    const { error } = await admin
      .from('profiles')
      .update({ approval_status: 'rejected' })
      .eq('id', userId)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  if (action === 'create') {
    if (!canManageUsers(callerRole)) {
      return json({ error: 'Only owners and admins can add users' }, 403)
    }

    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const fullName = String(body.full_name ?? '').trim()
    const role = String(body.role ?? 'editor') as StaffRole

    if (!email || !password || password.length < 8) {
      return json({ error: 'Valid email and password (min 8 characters) are required' }, 400)
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return json({ error: 'Invalid role' }, 400)
    }
    if (role === 'owner' && callerRole !== 'owner') {
      return json({ error: 'Only an owner can create another owner account' }, 403)
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || email },
    })

    if (createError) {
      const message = createError.message.includes('already')
        ? 'A user with this email already exists'
        : createError.message
      return json({ error: message }, 400)
    }

    const userId = created.user?.id
    if (!userId) {
      return json({ error: 'User was not created' }, 500)
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        full_name: fullName || null,
        role,
        approval_status: 'approved',
      })
      .eq('id', userId)

    if (profileError) {
      return json({ error: profileError.message }, 500)
    }

    return json({
      user: { id: userId, email, full_name: fullName || null, role },
    })
  }

  return json({ error: 'Unknown action' }, 400)
})
