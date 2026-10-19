import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { COMPANY } from '@/lib/constants'
import { useAdminSession } from '../useAdminSession'

export function AdminLoginPage() {
  const { session, loading } = useAdminSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/admin/dashboard" replace />

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative flex min-h-[280px] flex-1 flex-col justify-between overflow-hidden lg:min-h-screen lg:max-w-[52%]">
        <div
          className="absolute inset-0 bg-cover bg-center motion-safe:scale-105 motion-safe:animate-[hero-ken-burns_28s_ease-in-out_infinite]"
          style={{ backgroundImage: 'url(/hero-equipment.jpg)' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface-dark/92 via-surface-dark/85 to-brand/40" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(181,31,50,0.35),transparent_55%)]" aria-hidden />

        <motion.div
          className="relative z-10 flex flex-col p-8 lg:p-12"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
            ← Back to website
          </Link>
          <div className="mt-10 inline-block max-w-[min(20rem,85vw)] rounded-xl bg-white/95 px-5 py-4 shadow-lg backdrop-blur-sm lg:max-w-[22rem]">
            <img
              src="/logo.png"
              alt={COMPANY.name}
              className="h-auto w-full object-contain object-left"
            />
          </div>
          <p className="mt-6 max-w-md text-lg font-medium text-white/95 lg:text-xl">
            Content management for {COMPANY.name}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            Manage products, inquiries, media, and site content securely. Authorized personnel only.
          </p>
        </motion.div>

        <p className="relative z-10 hidden p-8 text-xs text-white/45 lg:block lg:p-12">
          &copy; {new Date().getFullYear()} {COMPANY.name}
        </p>
      </div>

      {/* Sign-in panel */}
      <div className="relative flex flex-1 items-center justify-center bg-surface-alt px-4 py-10 lg:bg-gradient-to-bl lg:from-white lg:to-surface-alt lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden>
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
        </div>

        <motion.form
          className="relative w-full max-w-md rounded-2xl border border-border/80 bg-white p-8 shadow-[0_8px_40px_rgba(20,20,20,0.08)] lg:p-10"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setSubmitting(true)
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
            setSubmitting(false)
            if (authError) setError(authError.message)
            else navigate('/admin/dashboard')
          }}
        >
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Admin portal</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">Sign in</h1>
            <p className="mt-2 text-sm text-text-muted">
              Use your staff credentials. Public registration is disabled.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-text">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-text">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <p className="rounded-md border border-brand/25 bg-brand/5 px-3 py-2 text-sm text-brand" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="h-12 w-full text-base" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in to CMS'}
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-text-muted">
            Need access? Contact your M2M administrator.
          </p>
        </motion.form>
      </div>
    </div>
  )
}
