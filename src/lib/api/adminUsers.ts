import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { UserRole } from '@/types/database'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type AdminUserRow = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  approval_status: ApprovalStatus
  created_at: string
  is_self: boolean
}

export type AdminUsersListResponse = {
  users: AdminUserRow[]
  pending: AdminUserRow[]
  can_manage_users: boolean
  can_change_roles: boolean
}

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }
}

function canManageUsers(role: UserRole): boolean {
  return role === 'owner' || role === 'admin'
}

async function listAdminUsersFromDb(): Promise<AdminUsersListResponse> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data: me, error: meErr } = await supabase
    .from('profiles')
    .select('role, approval_status')
    .eq('id', user.id)
    .single()
  if (meErr || !me) throw new Error('Could not load your profile.')

  const myRole = me.role as UserRole
  const cmsRoles: UserRole[] = ['owner', 'admin', 'editor']
  if (me.approval_status !== 'approved' || !cmsRoles.includes(myRole)) {
    throw new Error('Your account cannot view team members.')
  }

  let profiles: Array<{
    id: string
    full_name: string | null
    email?: string | null
    role: UserRole
    approval_status: ApprovalStatus
    created_at: string
  }> | null = null

  const withEmail = await supabase
    .from('profiles')
    .select('id, full_name, email, role, approval_status, created_at')
    .order('created_at', { ascending: true })
  if (!withEmail.error) {
    profiles = withEmail.data
  } else {
    const basic = await supabase
      .from('profiles')
      .select('id, full_name, role, approval_status, created_at')
      .order('created_at', { ascending: true })
    if (basic.error) throw new Error(basic.error.message)
    profiles = basic.data
  }

  const users: AdminUserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    email: p.email ?? '',
    full_name: p.full_name,
    role: p.role as UserRole,
    approval_status: p.approval_status as ApprovalStatus,
    created_at: p.created_at,
    is_self: p.id === user.id,
  }))

  return {
    users,
    pending: users.filter((u) => u.approval_status === 'pending'),
    can_manage_users: canManageUsers(myRole),
    can_change_roles: myRole === 'owner',
  }
}

export async function listAdminUsers(): Promise<AdminUsersListResponse> {
  assertConfigured()
  // Same source as Dashboard “Pending registrations” — do not use Edge Function list
  // (older deploys omit `pending` and hide waiting sign-ups).
  return listAdminUsersFromDb()
}

export async function createAdminUser(payload: {
  email: string
  password: string
  full_name: string
  role: UserRole
}) {
  assertConfigured()
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'create', ...payload },
  })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
  return data as { user: Pick<AdminUserRow, 'id' | 'email' | 'full_name' | 'role'> }
}

export async function approveAdminUser(userId: string, role: 'admin' | 'editor') {
  assertConfigured()

  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'approve', user_id: userId, role },
  })
  if (!error && data && !data.error) return

  const { error: upErr } = await supabase
    .from('profiles')
    .update({ approval_status: 'approved', role })
    .eq('id', userId)
    .eq('approval_status', 'pending')
  if (upErr) {
    if (data?.error) throw new Error(String(data.error))
    if (error) throw error
    throw upErr
  }
}

export async function rejectAdminUser(userId: string) {
  assertConfigured()

  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'reject', user_id: userId },
  })
  if (!error && data && !data.error) return

  const { error: upErr } = await supabase.from('profiles').update({ approval_status: 'rejected' }).eq('id', userId)
  if (upErr) {
    if (data?.error) throw new Error(String(data.error))
    if (error) throw error
    throw upErr
  }
}
