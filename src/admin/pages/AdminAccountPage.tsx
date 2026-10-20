import { AdminCard } from '../components/AdminCard'
import { AdminChangePasswordCard } from '../components/AdminChangePasswordCard'
import { useAdminProfile } from '../useAdminProfile'

export function AdminAccountPage() {
  const { data: profile } = useAdminProfile()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">My account</h1>
        <p className="mt-2 text-sm text-text-muted">Your profile and sign-in password.</p>
      </div>

      <AdminCard title="Signed in as" description="Your admin profile from Supabase Auth.">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Email</dt>
            <dd className="font-medium text-text">{profile?.email ?? '…'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Name</dt>
            <dd className="font-medium text-text">{profile?.full_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Role</dt>
            <dd className="font-medium capitalize text-text">{profile?.role ?? '…'}</dd>
          </div>
        </dl>
      </AdminCard>

      <AdminChangePasswordCard />
    </div>
  )
}
