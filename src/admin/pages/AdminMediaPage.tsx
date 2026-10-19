import { useQuery } from '@tanstack/react-query'
import { supabase, getStoragePublicUrl } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function AdminMediaPage() {
  const { data: assets = [], refetch } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false }).limit(100)
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Media library</h1>
      <p className="mt-2 text-sm text-text-muted">Upload via import script or product editor. Alt text editable in database.</p>
      <Button className="mt-4" onClick={() => refetch()}>Refresh</Button>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {assets.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-white p-2">
            <div className="flex aspect-square items-center justify-center bg-surface-alt p-2">
              <img
                src={getStoragePublicUrl(a.asset_category === 'brand' ? 'brand-logos' : 'product-images', a.storage_path)}
                alt={a.alt_text ?? ''}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="mt-2 truncate text-xs">{a.filename}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
