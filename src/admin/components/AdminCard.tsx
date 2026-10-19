import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-white p-6 shadow-sm', className)}>
      <div className="mb-5 border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}
