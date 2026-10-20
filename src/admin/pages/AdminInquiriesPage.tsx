import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { INQUIRY_STATUSES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { AdminCard } from '../components/AdminCard'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import { AdminModal } from '../components/AdminModal'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'
import { AdminStatusBadge } from '../components/AdminStatusBadge'
type InquiryRow = {
  id: string
  public_reference: string
  full_name: string
  company_name: string | null
  email: string
  phone: string | null
  status: string
  created_at: string
  inquiry_items?: { id: string; product_name_snapshot: string; quantity: number }[]
}

export function AdminInquiriesPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<InquiryRow | null>(null)

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, inquiry_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as InquiryRow[]
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inquiries'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inquiries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inquiries'] })
      setSelected(null)
    },
  })

  const exportCsv = () => {
    const header = ['reference', 'name', 'company', 'email', 'phone', 'status', 'created_at']
    const rows = inquiries.map((i) =>
      [i.public_reference, i.full_name, i.company_name, i.email, i.phone, i.status, i.created_at].join(','),
    )
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inquiries.csv'
    a.click()
  }

  const newCount = inquiries.filter((i) => i.status === 'new').length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Product inquiries"
        description="Quote requests from the public site. Click a row for full details."
        actions={
          <Button type="button" variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total inquiries" value={isLoading ? '—' : inquiries.length} icon={MessageSquare} accent="slate" />
        <AdminStatCard label="New / unread" value={isLoading ? '—' : newCount} icon={MessageSquare} accent="brand" />
        <AdminStatCard
          label="In progress"
          value={isLoading ? '—' : inquiries.filter((i) => !['new', 'closed', 'won', 'lost'].includes(i.status)).length}
          icon={MessageSquare}
          accent="blue"
        />
      </div>

      <AdminCard title="All inquiries" description={isLoading ? 'Loading…' : `${inquiries.length} record(s)`}>
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <button
              key={inq.id}
              type="button"
              className="w-full rounded-xl border border-border bg-surface-alt/40 p-4 text-left text-sm transition-colors hover:border-brand/30 hover:bg-white"
              onClick={() => setSelected(inq)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono font-semibold text-text">{inq.public_reference}</p>
                  <p className="mt-1 text-text">
                    {inq.full_name}
                    {inq.company_name ? ` — ${inq.company_name}` : ''}
                  </p>
                  <p className="text-text-muted">
                    {inq.email} · {inq.phone}
                  </p>
                </div>
                <AdminStatusBadge status={inq.status} />
              </div>
            </button>
          ))}
          {!isLoading && inquiries.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">No inquiries yet.</p>
          )}
        </div>
      </AdminCard>

      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.public_reference ?? 'Inquiry'}
        description={selected ? `${selected.full_name} · ${selected.email}` : undefined}
        size="lg"
        footer={
          selected && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <select
                className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                value={selected.status}
                onChange={(e) => {
                  const status = e.target.value
                  updateStatus.mutate({ id: selected.id, status })
                  setSelected({ ...selected, status })
                }}
              >
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <AdminDeleteButton
                confirmMessage={`Delete inquiry ${selected.public_reference}?`}
                onDelete={async () => {
                  await remove.mutateAsync(selected.id)
                }}
              />
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-text-muted">Company</dt>
                <dd className="mt-0.5 text-text">{selected.company_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-text-muted">Phone</dt>
                <dd className="mt-0.5 text-text">{selected.phone || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase text-text-muted">Submitted</dt>
                <dd className="mt-0.5 text-text">{new Date(selected.created_at).toLocaleString()}</dd>
              </div>
            </dl>
            <div>
              <p className="text-xs font-semibold uppercase text-text-muted">Line items</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
                {selected.inquiry_items?.map((item) => (
                  <li key={item.id}>
                    {item.product_name_snapshot} × {item.quantity}
                  </li>
                )) ?? <li>No items</li>}
              </ul>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
