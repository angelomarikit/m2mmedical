import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminModal } from './AdminModal'
import { cn } from '@/lib/cn'

export function AdminDeleteButton({
  label = 'Delete',
  confirmMessage,
  onDelete,
  disabled,
  className,
  variant = 'link',
}: {
  label?: string
  confirmMessage: string
  onDelete: () => Promise<void>
  disabled?: boolean
  className?: string
  variant?: 'link' | 'button'
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function confirmDelete() {
    setPending(true)
    try {
      await onDelete()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  const trigger =
    variant === 'button' ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || pending}
        className={cn('border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50', className)}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </Button>
    ) : (
      <button
        type="button"
        disabled={pending || disabled}
        className={
          className ??
          'inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50'
        }
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {pending ? 'Deleting…' : label}
      </button>
    )

  return (
    <>
      {trigger}
      <AdminModal
        open={open}
        onClose={() => {
          if (!pending) setOpen(false)
        }}
        title="Confirm deletion"
        description={confirmMessage}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => void confirmDelete()}
            >
              {pending ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-muted">This action cannot be undone.</p>
      </AdminModal>
    </>
  )
}
