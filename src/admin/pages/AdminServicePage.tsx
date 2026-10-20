import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminCard } from '../components/AdminCard'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import { AdminModal } from '../components/AdminModal'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'

type ServiceRow = {
  id: string
  equipment_type: string
  requested_service: string
  full_name: string
  company_name: string | null
  email: string | null
  issue_description: string
  status: string
  created_at: string
}

export function AdminServicePage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<ServiceRow | null>(null)

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-service'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_inquiries').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as ServiceRow[]
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_inquiries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-service'] })
      setSelected(null)
    },
  })

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Service inquiries" description="Biomedical service requests from the website." />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard label="Total requests" value={isLoading ? '—' : rows.length} icon={Wrench} accent="slate" />
        <AdminStatCard
          label="New"
          value={isLoading ? '—' : rows.filter((r) => r.status === 'new').length}
          icon={Wrench}
          accent="brand"
        />
      </div>

      <AdminCard title="Requests" description={isLoading ? 'Loading…' : `${rows.length} request(s)`}>
        <div className="space-y-3">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              className="w-full rounded-xl border border-border p-4 text-left text-sm transition-colors hover:border-brand/30 hover:bg-surface-alt/50"
              onClick={() => setSelected(r)}
            >
              <p className="font-semibold text-text">
                {r.equipment_type} — {r.requested_service}
              </p>
              <p className="mt-1 text-text-muted">
                {r.full_name} · {r.company_name}
              </p>
            </button>
          ))}
          {!isLoading && rows.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">No service inquiries yet.</p>
          )}
        </div>
      </AdminCard>

      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.equipment_type}` : 'Service request'}
        description={selected ? `${selected.full_name} · ${selected.requested_service}` : undefined}
        size="lg"
        footer={
          selected && (
            <AdminDeleteButton
              confirmMessage="Delete this service inquiry?"
              onDelete={async () => {
                await remove.mutateAsync(selected.id)
              }}
            />
          )
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <p className="whitespace-pre-wrap text-text">{selected.issue_description}</p>
            <p className="text-xs text-text-muted">Received {new Date(selected.created_at).toLocaleString()}</p>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
