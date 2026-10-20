import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AdminCard } from '../components/AdminCard'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { FormField } from '../components/FormField'
import { SaveBanner } from '../components/SaveBanner'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import {
  approveAdminUser,
  createAdminUser,
  listAdminUsers,
  rejectAdminUser,
} from '@/lib/api/adminUsers'
import type { UserRole } from '@/types/database'

const ROLES: UserRole[] = ['owner', 'admin', 'editor', 'sales']

const createUserSchema = z.object({
  email: z.string().email('Enter a valid email'),
  full_name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['owner', 'admin', 'editor', 'sales']),
})

type CreateUserForm = z.infer<typeof createUserSchema>

export function AdminUsersPage() {
  const qc = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: listAdminUsers,
  })

  const users = data?.users ?? []
  const pending = data?.pending ?? []
  const canManage = data?.can_manage_users ?? false
  const canChangeRoles = data?.can_change_roles ?? false

  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', full_name: '', password: '', role: 'editor' },
  })

  const createUser = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      createForm.reset({ email: '', full_name: '', password: '', role: 'editor' })
      setNotice('User created and approved. They can sign in immediately.')
    },
    onError: (e: Error) => setNotice(e.message || 'Could not create user.'),
  })

  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setNotice('Role updated.')
    },
    onError: () => setNotice('Could not change role. Only owners can assign roles.'),
  })

  const approve = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'editor' }) => approveAdminUser(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      setNotice('Registration approved.')
    },
    onError: (e: Error) => setNotice(e.message),
  })

  const reject = useMutation({
    mutationFn: rejectAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      setNotice('Registration rejected.')
    },
    onError: (e: Error) => setNotice(e.message),
  })

  const assignableRoles = canChangeRoles ? ROLES : ROLES.filter((r) => r !== 'owner')

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Users & access"
        description="Approve self-registrations, create accounts, and assign roles. Staff (editor) and admin use the same CMS."
      />

      <SaveBanner
        message={notice}
        tone={notice && (notice.startsWith('Could not') || notice.includes('Deploy')) ? 'error' : 'success'}
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load users: {error instanceof Error ? error.message : 'Unknown error'}. Run{' '}
          <code className="text-text">docs/FIX_PENDING_REGISTRATIONS.sql</code> in Supabase SQL Editor.
        </p>
      )}

      {!error && !isLoading && canManage && pending.length === 0 && (
        <AdminCard title="Pending registrations" description="No one waiting for approval right now.">
          <p className="text-sm text-text-muted">
            New sign-ups from <strong>/admin/register</strong> appear here. If someone registered but you do not see them,
            run <code className="text-xs">docs/FIX_PENDING_REGISTRATIONS.sql</code> and confirm{' '}
            <code className="text-xs">register-staff</code> is deployed (or check Table Editor → profiles →{' '}
            <code className="text-xs">approval_status</code> = pending).
          </p>
        </AdminCard>
      )}

      {pending.length > 0 && (
        <AdminCard
          title={`Pending registrations (${pending.length})`}
          description={
            canManage
              ? 'Approve as Staff or Admin — they can sign in after approval.'
              : 'Only an owner or admin can approve these accounts.'
          }
        >
          <ul className="divide-y divide-border">
            {pending.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{u.full_name ?? 'Unnamed'}</p>
                  <p className="text-sm text-text-muted">{u.email || u.id}</p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" disabled={approve.isPending} onClick={() => approve.mutate({ id: u.id, role: 'editor' })}>
                      Approve as staff
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={approve.isPending} onClick={() => approve.mutate({ id: u.id, role: 'admin' })}>
                      Approve as admin
                    </Button>
                    <AdminDeleteButton
                      label="Reject"
                      confirmMessage={`Reject registration for ${u.email || u.full_name}?`}
                      onDelete={async () => {
                        await reject.mutateAsync(u.id)
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Ask an owner or admin to approve.</p>
                )}
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      {canManage && (
        <AdminCard title="Add user directly" description="Creates an approved account — share the password securely.">
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={createForm.handleSubmit((values) => createUser.mutate(values))}
          >
            <FormField label="Full name" htmlFor="user-full-name">
              <Input id="user-full-name" {...createForm.register('full_name')} />
            </FormField>
            <FormField label="Email" htmlFor="user-email">
              <Input id="user-email" type="email" autoComplete="off" {...createForm.register('email')} />
            </FormField>
            <FormField label="Password" htmlFor="user-password" hint="Min. 8 characters.">
              <Input id="user-password" type="password" autoComplete="new-password" {...createForm.register('password')} />
            </FormField>
            <FormField label="Role" htmlFor="user-role">
              <select
                id="user-role"
                className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm"
                {...createForm.register('role')}
              >
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? 'Creating…' : 'Create user'}
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard title="Team members" description={isLoading ? 'Loading…' : `${users.filter((u) => u.approval_status === 'approved').length} active user(s)`}>
        <ul className="divide-y divide-border">
          {users
            .filter((u) => u.approval_status === 'approved')
            .map((u) => (
              <li key={u.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-text">
                    {u.full_name || 'Unnamed user'}
                    {u.is_self && <span className="ml-2 text-xs font-normal text-text-muted">(you)</span>}
                  </p>
                  <p className="text-sm text-text-muted">{u.email || u.id}</p>
                </div>
                {canChangeRoles ? (
                  <select
                    className="h-10 rounded-md border border-border bg-white px-3 text-sm capitalize"
                    value={u.role}
                    disabled={setRole.isPending || (u.role === 'owner' && u.is_self)}
                    onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value as UserRole })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="inline-flex rounded-md border border-border bg-surface-alt px-3 py-1.5 text-sm capitalize text-text">
                    {u.role}
                  </span>
                )}
              </li>
            ))}
        </ul>
      </AdminCard>
    </div>
  )
}
