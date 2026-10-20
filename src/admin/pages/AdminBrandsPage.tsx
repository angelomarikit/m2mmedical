import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tags } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AdminCard } from '../components/AdminCard'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import { AdminModal } from '../components/AdminModal'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'
import { AdminStatusBadge } from '../components/AdminStatusBadge'
import { slugify } from '../lib/slugify'

export function AdminBrandsPage() {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addSlug, setAddSlug] = useState('')
  const [addActive, setAddActive] = useState(true)
  const [addError, setAddError] = useState<string | null>(null)

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brands').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })

  const update = useMutation({
    mutationFn: async (row: { id: string; name?: string; is_active?: boolean }) => {
      const { error } = await supabase.from('brands').update(row).eq('id', row.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-brands'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brands').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-brands'] }),
  })

  const create = useMutation({
    mutationFn: async () => {
      const name = addName.trim()
      const slug = addSlug.trim() || slugify(name)
      if (!name || !slug) throw new Error('Name and slug are required.')
      const { error } = await supabase.from('brands').insert({ name, slug, is_active: addActive })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-brands'] })
      setAddOpen(false)
      setAddName('')
      setAddSlug('')
      setAddActive(true)
      setAddError(null)
    },
    onError: (e: Error) => setAddError(e.message),
  })

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Brands"
        description="Manufacturers and labels shown on products and filters."
        actions={
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add brand
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard label="Total brands" value={isLoading ? '—' : brands.length} icon={Tags} accent="slate" />
        <AdminStatCard
          label="Active"
          value={isLoading ? '—' : brands.filter((b) => b.is_active).length}
          icon={Tags}
          accent="emerald"
        />
      </div>

      <AdminCard title="Brand directory" description={isLoading ? 'Loading…' : `${brands.length} brand(s)`}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-surface-alt/40">
                  <td className="px-4 py-3">
                    <Input
                      defaultValue={b.name}
                      className="max-w-xs"
                      onBlur={(e) => {
                        const name = e.target.value.trim()
                        if (name && name !== b.name) update.mutate({ id: b.id, name })
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">/{b.slug}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => update.mutate({ id: b.id, is_active: !b.is_active })}>
                      <AdminStatusBadge status={b.is_active ? 'published' : 'draft'} />
                      <span className="sr-only">{b.is_active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminDeleteButton
                      variant="button"
                      confirmMessage={`Delete brand “${b.name}”?`}
                      onDelete={async () => {
                        await remove.mutateAsync(b.id)
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
        title="Add brand"
        description="Add a manufacturer or product line."
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={create.isPending || !addName.trim()} onClick={() => create.mutate()}>
              {create.isPending ? 'Saving…' : 'Create brand'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="brand-name">
              Brand name
            </label>
            <Input
              id="brand-name"
              value={addName}
              onChange={(e) => {
                setAddName(e.target.value)
                if (!addSlug || addSlug === slugify(addName)) setAddSlug(slugify(e.target.value))
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="brand-slug">
              Slug
            </label>
            <Input id="brand-slug" value={addSlug} onChange={(e) => setAddSlug(slugify(e.target.value))} className="font-mono" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={addActive} onChange={(e) => setAddActive(e.target.checked)} />
            Active on the website
          </label>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
        </div>
      </AdminModal>
    </div>
  )
}
