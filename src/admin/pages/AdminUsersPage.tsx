import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function AdminUsersPage() {
  const qc = useQueryClient()
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at')
      if (error) throw error
      return data
    },
  })

  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin users</h1>
      <p className="mt-2 text-sm text-text-muted">Role changes require owner privileges (enforced by RLS).</p>
      <ul className="mt-6 space-y-3">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-4 text-sm">
            <span className="font-medium">{u.full_name ?? u.id}</span>
            <select
              className="rounded-md border border-border px-2 py-1"
              value={u.role}
              onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
            >
              {['owner', 'admin', 'editor', 'sales'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  )
}
