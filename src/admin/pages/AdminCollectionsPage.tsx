import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AdminCollectionsPage() {
  const qc = useQueryClient()
  const { data: collections = [] } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collections').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })

  const update = useMutation({
    mutationFn: async (row: { id: string; is_published?: boolean; name?: string }) => {
      const { error } = await supabase.from('collections').update(row).eq('id', row.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-collections'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button onClick={async () => {
          await supabase.from('collections').insert({
            name: 'New collection',
            slug: `collection-${Date.now()}`,
            is_published: false,
          })
          qc.invalidateQueries({ queryKey: ['admin-collections'] })
        }}>Add collection</Button>
      </div>
      <div className="mt-6 space-y-3">
        {collections.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-4">
            <Input
              defaultValue={c.name}
              className="max-w-xs"
              onBlur={(e) => update.mutate({ id: c.id, name: e.target.value })}
            />
            <span className="text-xs text-text-muted">/{c.slug}</span>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={c.is_published}
                onChange={(e) => update.mutate({ id: c.id, is_published: e.target.checked })}
              />
              Published
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
