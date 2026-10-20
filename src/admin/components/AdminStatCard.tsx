import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

const accents = {
  brand: {
    icon: 'bg-brand/10 text-brand',
    ring: 'hover:ring-brand/20',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-700',
    ring: 'hover:ring-emerald-500/20',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-700',
    ring: 'hover:ring-amber-500/20',
  },
  blue: {
    icon: 'bg-blue-500/10 text-blue-700',
    ring: 'hover:ring-blue-500/20',
  },
  slate: {
    icon: 'bg-slate-500/10 text-slate-700',
    ring: 'hover:ring-slate-500/20',
  },
} as const

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'brand',
  href,
  onClick,
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  accent?: keyof typeof accents
  href?: string
  onClick?: () => void
}) {
  const styles = accents[accent]
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', styles.icon)}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {hint && <span className="text-xs font-medium text-text-muted">{hint}</span>}
      </div>
      <p className="mt-4 text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-text">{value}</p>
    </>
  )

  const className = cn(
    'rounded-2xl border border-border bg-white p-5 shadow-sm ring-1 ring-transparent transition-all',
    styles.ring,
    (href || onClick) && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
  )

  if (href) {
    return (
      <Link to={href} className={className}>
        {inner}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" className={cn(className, 'w-full text-left')} onClick={onClick}>
        {inner}
      </button>
    )
  }

  return <div className={className}>{inner}</div>
}
