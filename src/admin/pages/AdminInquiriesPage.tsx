import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { INQUIRY_STATUSES } from '@/lib/constants'

export function AdminInquiriesPage() {
  const qc = useQueryClient()
  const { data: inquiries = [] } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, inquiry_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inquiries'] }),
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product inquiries</h1>
        <button type="button" className="text-sm text-brand hover:underline" onClick={exportCsv}>
          Export CSV
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {inquiries.map((inq) => (
          <div key={inq.id} className="rounded-lg border border-border bg-white p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono font-semibold">{inq.public_reference}</p>
                <p className="mt-1">{inq.full_name} — {inq.company_name}</p>
                <p className="text-text-muted">{inq.email} · {inq.phone}</p>
              </div>
              <select
                className="rounded-md border border-border px-2 py-1 text-sm"
                value={inq.status}
                onChange={(e) => updateStatus.mutate({ id: inq.id, status: e.target.value })}
              >
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <ul className="mt-3 list-disc pl-5 text-text-muted">
              {inq.inquiry_items?.map((item: { id: string; product_name_snapshot: string; quantity: number }) => (
                <li key={item.id}>{item.product_name_snapshot} × {item.quantity}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
