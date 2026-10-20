import { cn } from '@/lib/cn'

const variants: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  draft: 'bg-amber-50 text-amber-900 ring-amber-600/20',
  archived: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  new: 'bg-brand/10 text-brand ring-brand/25',
  pending: 'bg-amber-50 text-amber-900 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-800 ring-red-600/20',
}

export function AdminStatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase()
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset',
        variants[key] ?? 'bg-surface-alt text-text-muted ring-border',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}
