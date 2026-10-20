import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AdminCard } from '../components/AdminCard'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import { AdminModal } from '../components/AdminModal'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'
import { AdminStatusBadge } from '../components/AdminStatusBadge'

export function AdminPartnersPage() {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState<'partner' | 'client'>('partner')
  const [addName, setAddName] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partners_clients').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })

  const update = useMutation({
    mutationFn: async (row: { id: string; name?: string; is_published?: boolean }) => {
      const { error } = await supabase.from('partners_clients').update(row).eq('id', row.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-partners'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('partners_clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-partners'] }),
  })

  const create = useMutation({
    mutationFn: async () => {
      const name = addName.trim()
      if (!name) throw new Error('Name is required.')
      const { error } = await supabase.from('partners_clients').insert({
        type: addType,
        name,
        is_published: false,
        sort_order: rows.length,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-partners'] })
      setAddOpen(false)
      setAddName('')
      setAddError(null)
    },
    onError: (e: Error) => setAddError(e.message),
  })

  const partners = rows.filter((r) => r.type === 'partner')
  const clients = rows.filter((r) => r.type === 'client')

  function openAdd(type: 'partner' | 'client') {
    setAddType(type)
    setAddName('')
    setAddError(null)
    setAddOpen(true)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Partners & clients"
        description="Logos and names shown on the homepage trust section."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => openAdd('partner')}>
              <Plus className="h-4 w-4" /> Add partner
            </Button>
            <Button type="button" onClick={() => openAdd('client')}>
              <Plus className="h-4 w-4" /> Add client
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Partners" value={isLoading ? '—' : partners.length} icon={Building2} accent="blue" />
        <AdminStatCard label="Clients" value={isLoading ? '—' : clients.length} icon={Users} accent="emerald" />
        <AdminStatCard
          label="Published"
          value={isLoading ? '—' : rows.filter((r) => r.is_published).length}
          icon={Building2}
          accent="slate"
        />
      </div>

      <AdminCard title="Directory" description={isLoading ? 'Loading…' : `${rows.length} entries`}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Visibility</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-alt/40">
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-semibold capitalize text-text-muted">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      defaultValue={r.name}
                      className="max-w-sm"
                      onBlur={(e) => {
                        const name = e.target.value.trim()
                        if (name && name !== r.name) update.mutate({ id: r.id, name })
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => update.mutate({ id: r.id, is_published: !r.is_published })}>
                      <AdminStatusBadge status={r.is_published ? 'published' : 'draft'} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminDeleteButton
                      variant="button"
                      confirmMessage={`Delete ${r.type} “${r.name}”?`}
                      onDelete={async () => {
                        await remove.mutateAsync(r.id)
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminModal
        open={addOpen}
        onClose={() => !create.isPending && setAddOpen(false)}
        title={addType === 'partner' ? 'Add partner' : 'Add client'}
        description="You can publish on the website after saving."
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={create.isPending || !addName.trim()} onClick={() => create.mutate()}>
              {create.isPending ? 'Saving…' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['partner', 'client'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  addType === t ? 'border-brand bg-brand/10 text-brand' : 'border-border text-text-muted hover:bg-surface-alt'
                }`}
                onClick={() => setAddType(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="partner-name">
              Organization name
            </label>
            <Input id="partner-name" value={addName} onChange={(e) => setAddName(e.target.value)} />
          </div>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
        </div>
      </AdminModal>
    </div>
  )
}
