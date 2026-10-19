export function SaveBanner({ message, tone = 'success' }: { message: string | null; tone?: 'success' | 'error' }) {
  if (!message) return null
  return (
    <div
      role="status"
      className={
        tone === 'success'
          ? 'mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800'
          : 'mb-6 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand'
      }
    >
      {message}
    </div>
  )
}
