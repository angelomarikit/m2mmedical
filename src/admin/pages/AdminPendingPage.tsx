import { Link, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { useAdminAccess } from '../useAdminAccess'

export function AdminPendingPage() {
  const { session, loading, canAccessCms, isPending, profile } = useAdminAccess()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-text-muted">Loading…</div>
  }
  if (!session) return <Navigate to="/admin/login" replace />
  if (canAccessCms) return <Navigate to="/admin/dashboard" replace />
  if (!isPending) return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-alt px-4 py-12 text-center">
      <div className="max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-text">Awaiting approval</h1>
        <p className="mt-3 text-sm text-text-muted">
          Hi {profile?.full_name ?? profile?.email ?? 'there'}, your registration is pending. An owner or administrator
          must approve your account before you can use the CMS.
        </p>
        <p className="mt-2 text-sm text-text-muted">Staff and admins use the same dashboard once approved.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Check again
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/admin/login'
            }}
          >
            Sign out
          </Button>
          <Link to="/" className="text-sm text-brand hover:underline">
            Back to website
          </Link>
        </div>
      </div>
    </div>
  )
}
