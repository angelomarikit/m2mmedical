import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminCard } from '../components/AdminCard'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import { AdminModal } from '../components/AdminModal'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'

type ContactMessage = {
  id: string
  subject: string
  full_name: string
  company_name: string | null
  email: string
  phone: string | null
  message: string
  status: string
  created_at: string
}

export function AdminContactPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-contact'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as ContactMessage[]
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-contact'] })
      setSelected(null)
    },
  })

  const newCount = messages.filter((m) => m.status === 'new').length

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Contact messages" description="Messages from the public contact form. Click to read full message." />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard label="Total messages" value={isLoading ? '—' : messages.length} icon={Mail} accent="slate" />
        <AdminStatCard label="New" value={isLoading ? '—' : newCount} icon={Mail} accent="brand" />
      </div>

      <AdminCard title="Inbox" description={isLoading ? 'Loading…' : `${messages.length} message(s)`}>
        <div className="space-y-3">
          {messages.map((m) => (
            <button
              key={m.id}
              type="button"
              className="w-full rounded-xl border border-border p-4 text-left text-sm transition-colors hover:border-brand/30 hover:bg-surface-alt/50"
              onClick={() => setSelected(m)}
            >
              <p className="font-semibold text-text">{m.subject}</p>
              <p className="mt-1 text-text-muted">
                {m.full_name} · {m.company_name} · {m.email}
              </p>
            </button>
          ))}
          {!isLoading && messages.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">No messages yet.</p>
          )}
        </div>
      </AdminCard>

      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? 'Message'}
        description={selected ? `${selected.full_name} · ${selected.email}` : undefined}
        size="lg"
        footer={
          selected && (
            <AdminDeleteButton
              confirmMessage="Delete this contact message?"
              onDelete={async () => {
                await remove.mutateAsync(selected.id)
              }}
            />
          )
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <p className="whitespace-pre-wrap text-text">{selected.message}</p>
            <p className="text-xs text-text-muted">Received {new Date(selected.created_at).toLocaleString()}</p>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
