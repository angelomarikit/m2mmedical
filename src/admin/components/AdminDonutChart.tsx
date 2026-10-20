import { cn } from '@/lib/cn'

export type DonutSegment = {
  label: string
  value: number
  color: string
}

export function AdminDonutChart({
  segments,
  className,
  centerLabel,
}: {
  segments: DonutSegment[]
  className?: string
  centerLabel?: string
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) {
    return <p className={cn('py-8 text-center text-sm text-text-muted', className)}>No data yet</p>
  }

  let cumulative = 0
  const gradientParts = segments.map((seg) => {
    const start = (cumulative / total) * 100
    cumulative += seg.value
    const end = (cumulative / total) * 100
    return `${seg.color} ${start}% ${end}%`
  })

  return (
    <div className={cn('flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center', className)}>
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${gradientParts.join(', ')})`,
        }}
      >
        <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="text-2xl font-bold tabular-nums text-text">{total}</span>
          {centerLabel && <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{centerLabel}</span>}
        </div>
      </div>
      <ul className="min-w-[10rem] space-y-2 text-sm">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-text">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.label}
            </span>
            <span className="tabular-nums font-medium text-text-muted">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
