import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderTree, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AdminCard } from '../components/AdminCard'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import { AdminModal } from '../components/AdminModal'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'
import { AdminStatusBadge } from '../components/AdminStatusBadge'
import { slugify } from '../lib/slugify'

type Collection = {
  id: string
  name: string
  slug: string
  description: string | null
  is_published: boolean
  sort_order: number
}

export function AdminCollectionsPage() {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addSlug, setAddSlug] = useState('')
  const [addPublished, setAddPublished] = useState(false)
  const [addDescription, setAddDescription] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collections').select('*').order('sort_order')
      if (error) throw error
      return data as Collection[]
    },
  })

  const update = useMutation({
    mutationFn: async (row: { id: string; is_published?: boolean; name?: string; description?: string | null }) => {
      const { error } = await supabase.from('collections').update(row).eq('id', row.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-collections'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('collections').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-collections'] }),
  })

  const create = useMutation({
    mutationFn: async () => {
      const name = addName.trim()
      const slug = (addSlug.trim() || slugify(name)).replace(/^\/+/, '')
      if (!name || !slug) throw new Error('Name and URL slug are required.')
      const { error } = await supabase.from('collections').insert({
        name,
        slug,
        description: addDescription.trim() || null,
        is_published: addPublished,
        sort_order: collections.length,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-collections'] })
      setAddOpen(false)
      setAddName('')
      setAddSlug('')
      setAddPublished(false)
      setAddDescription('')
      setAddError(null)
    },
    onError: (e: Error) => setAddError(e.message),
  })

  const publishedCount = collections.filter((c) => c.is_published).length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Collections"
        description="Group products for the catalog and navigation. Edit names inline; add new collections with the form."
        actions={
          <Button
            type="button"
            onClick={() => {
              setAddError(null)
              setAddOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add collection
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard label="Total collections" value={isLoading ? '—' : collections.length} icon={FolderTree} accent="slate" />
        <AdminStatCard label="Published" value={isLoading ? '—' : publishedCount} icon={FolderTree} accent="emerald" />
      </div>

      <AdminCard title="All collections" description={isLoading ? 'Loading…' : `${collections.length} collection(s)`}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">URL slug</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {collections.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-surface-alt/40">
                  <td className="px-4 py-3">
                    <Input
                      defaultValue={c.name}
                      className="min-w-[10rem] max-w-xs"
                      onBlur={(e) => {
                        const name = e.target.value.trim()
                        if (name && name !== c.name) update.mutate({ id: c.id, name })
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">/{c.slug}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2"
                      onClick={() => update.mutate({ id: c.id, is_published: !c.is_published })}
                    >
                      <AdminStatusBadge status={c.is_published ? 'published' : 'draft'} />
                    </button>
                  </td>
                  <td className="hidden max-w-xs px-4 py-3 md:table-cell">
                    <Input
                      defaultValue={c.description ?? ''}
                      placeholder="Optional description"
                      onBlur={(e) => {
                        const description = e.target.value.trim() || null
                        if (description !== (c.description ?? '')) update.mutate({ id: c.id, description })
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminDeleteButton
                      variant="button"
                      confirmMessage={`Delete collection “${c.name}”? Products will be unlinked from this collection.`}
                      onDelete={async () => {
                        await remove.mutateAsync(c.id)
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && collections.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-text-muted">No collections yet. Add your first collection above.</p>
          )}
        </div>
      </AdminCard>

      <AdminModal
        open={addOpen}
        onClose={() => {
          if (!create.isPending) setAddOpen(false)
        }}
        title="Add collection"
        description="Create a new product group for the public catalog."
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={create.isPending} onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={create.isPending || !addName.trim()} onClick={() => create.mutate()}>
              {create.isPending ? 'Creating…' : 'Create collection'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="col-name">
              Display name
            </label>
            <Input
              id="col-name"
              value={addName}
              onChange={(e) => {
                setAddName(e.target.value)
                if (!addSlug || addSlug === slugify(addName)) setAddSlug(slugify(e.target.value))
              }}
              placeholder="e.g. Patient Monitoring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="col-slug">
              URL slug
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-text-muted">/</span>
              <Input
                id="col-slug"
                value={addSlug}
                onChange={(e) => setAddSlug(slugify(e.target.value))}
                placeholder="patient-monitoring"
                className="font-mono"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="col-desc">
              Description <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <Textarea id="col-desc" rows={3} value={addDescription} onChange={(e) => setAddDescription(e.target.value)} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={addPublished} onChange={(e) => setAddPublished(e.target.checked)} />
            Publish immediately on the website
          </label>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
        </div>
      </AdminModal>
    </div>
  )
}
