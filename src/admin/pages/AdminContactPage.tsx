import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function AdminContactPage() {
  const { data: messages = [] } = useQuery({
    queryKey: ['admin-contact'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Contact messages</h1>
      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-white p-4 text-sm">
            <p className="font-semibold">{m.subject}</p>
            <p className="text-text-muted">{m.full_name} · {m.company_name} · {m.email}</p>
            <p className="mt-2 whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
