import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { registerStaffAccount } from '@/lib/api/registerStaff'
import { useAdminAccess } from '../useAdminAccess'

export function AdminRegisterPage() {
  const navigate = useNavigate()
  const { session, canAccessCms, loading } = useAdminAccess()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session && canAccessCms) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4 py-12">
      <form
        className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          if (password !== confirm) {
            setError('Passwords do not match')
            return
          }
          setSubmitting(true)
          try {
            const res = await registerStaffAccount({ email, password, full_name: fullName })
            navigate('/admin/login', {
              replace: true,
              state: { registrationSuccess: res.message },
            })
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Staff registration</p>
        <h1 className="mt-2 text-2xl font-bold">Request admin access</h1>
        <p className="mt-2 text-sm text-text-muted">
          Create an account for review. No email confirmation is required — an owner or admin must approve you before
          sign-in works.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="reg-name">
              Full name
            </label>
            <Input id="reg-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="reg-email">
              Email
            </label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="reg-password">
              Password
            </label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="reg-confirm">
              Confirm password
            </label>
            <Input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-brand">{error}</p>}

        <Button type="submit" className="mt-6 w-full" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit registration'}
        </Button>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already approved?{' '}
          <Link to="/admin/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
