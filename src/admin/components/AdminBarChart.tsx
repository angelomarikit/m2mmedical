import { cn } from '@/lib/cn'

export type BarChartItem = {
  label: string
  value: number
  color?: string
}

export function AdminBarChart({
  items,
  className,
  emptyLabel = 'No data yet',
}: {
  items: BarChartItem[]
  className?: string
  emptyLabel?: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const total = items.reduce((s, i) => s + i.value, 0)

  if (total === 0) {
    return <p className={cn('py-8 text-center text-sm text-text-muted', className)}>{emptyLabel}</p>
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100)
        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-text">{item.label}</span>
              <span className="tabular-nums text-text-muted">{item.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
              <div
                className={cn('h-full rounded-full transition-all duration-500', item.color ?? 'bg-brand')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
