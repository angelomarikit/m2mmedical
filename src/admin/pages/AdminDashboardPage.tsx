import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  FileEdit,
  MessageSquare,
  UserPlus,
  FolderTree,
  Tags,
  Mail,
  Wrench,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { AdminBarChart } from '../components/AdminBarChart'
import { AdminCard } from '../components/AdminCard'
import { AdminDonutChart } from '../components/AdminDonutChart'
import { AdminModal } from '../components/AdminModal'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'
import { AdminStatusBadge } from '../components/AdminStatusBadge'
import { useAdminDashboardStats } from '../hooks/useAdminDashboardStats'
import { useAdminProfile } from '../useAdminProfile'
import { Button } from '@/components/ui/Button'

const QUICK_LINKS = [
  { to: '/admin/products', label: 'Products', icon: Package, desc: 'Catalog & photos' },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare, desc: 'Quote requests' },
  { to: '/admin/users', label: 'Users', icon: UserPlus, desc: 'Approvals & roles' },
  { to: '/admin/settings', label: 'Settings', icon: Sparkles, desc: 'Logo & SEO' },
] as const

export function AdminDashboardPage() {
  const { data: profile } = useAdminProfile()
  const { data: stats, isLoading } = useAdminDashboardStats()
  const [messagesOpen, setMessagesOpen] = useState(false)

  const firstName = profile?.full_name?.split(/\s+/)[0] ?? 'there'

  const productBars = stats
    ? [
        { label: 'Published', value: stats.published, color: 'bg-emerald-500' },
        { label: 'Draft', value: stats.drafts, color: 'bg-amber-500' },
        { label: 'Archived', value: stats.archived, color: 'bg-slate-400' },
      ]
    : []

  const inquiryDonut = stats
    ? [
        { label: 'New', value: stats.inquiryTally.get('new') ?? 0, color: '#b51f32' },
        { label: 'Reviewing', value: stats.inquiryTally.get('reviewing') ?? 0, color: '#d97706' },
        { label: 'Contacted', value: stats.inquiryTally.get('contacted') ?? 0, color: '#2563eb' },
        { label: 'Closed / won', value: (stats.inquiryTally.get('closed') ?? 0) + (stats.inquiryTally.get('won') ?? 0), color: '#64748b' },
      ].filter((s) => s.value > 0)
    : []

  return (
    <div className="space-y-8 pb-4">
      <AdminPageHeader
        title={`Welcome back, ${firstName}`}
        description="Overview of your catalog, customer messages, and team activity."
        actions={
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-white px-5 text-sm font-medium text-text transition-colors hover:border-brand hover:text-brand"
          >
            View public site
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Published products"
          value={isLoading ? '—' : (stats?.published ?? 0)}
          icon={Package}
          accent="emerald"
          href="/admin/products"
        />
        <AdminStatCard
          label="Draft products"
          value={isLoading ? '—' : (stats?.drafts ?? 0)}
          icon={FileEdit}
          accent="amber"
          href="/admin/products"
        />
        <AdminStatCard
          label="New customer messages"
          value={isLoading ? '—' : (stats?.messagesNew ?? 0)}
          icon={MessageSquare}
          accent="brand"
          hint="Inquiries + contact + service"
          onClick={() => setMessagesOpen(true)}
        />
        <AdminStatCard
          label="Pending registrations"
          value={isLoading ? '—' : (stats?.pendingStaff ?? 0)}
          icon={UserPlus}
          accent="blue"
          href="/admin/users"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Product catalog" description="Status breakdown across your inventory.">
          <AdminBarChart items={productBars} emptyLabel="No products in database yet." />
          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <FolderTree className="h-4 w-4" /> {stats?.collections ?? '—'} collections
            </span>
            <span className="flex items-center gap-1.5">
              <Tags className="h-4 w-4" /> {stats?.brands ?? '—'} brands
            </span>
          </div>
        </AdminCard>

        <AdminCard title="Inquiry pipeline" description="Where quote requests sit in your workflow.">
          <AdminDonutChart segments={inquiryDonut} centerLabel="Total" />
          <Link
            to="/admin/inquiries"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Open inquiries <ArrowRight className="h-4 w-4" />
          </Link>
        </AdminCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
          >
            <Icon className="h-6 w-6 text-brand" />
            <p className="mt-3 font-semibold text-text group-hover:text-brand">{label}</p>
            <p className="mt-1 text-xs text-text-muted">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Recent inquiries" description="Latest product quote requests.">
          {stats?.recentInquiries.length ? (
            <ul className="divide-y divide-border">
              {stats.recentInquiries.map((inq) => (
                <li key={inq.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-mono text-sm font-semibold text-text">{inq.public_reference}</p>
                    <p className="text-sm text-text-muted">
                      {inq.full_name}
                      {inq.company_name ? ` · ${inq.company_name}` : ''}
                    </p>
                  </div>
                  <AdminStatusBadge status={inq.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No inquiries yet.</p>
          )}
          <Link to="/admin/inquiries" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            View all inquiries
          </Link>
        </AdminCard>

        <AdminCard title="Recent contact messages" description="Latest messages from the contact form.">
          {stats?.recentContact.length ? (
            <ul className="divide-y divide-border">
              {stats.recentContact.map((m) => (
                <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium text-text">{m.subject}</p>
                  <p className="text-sm text-text-muted">
                    {m.full_name} · {m.email}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No contact messages yet.</p>
          )}
          <Link to="/admin/contact-messages" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            View contact inbox
          </Link>
        </AdminCard>
      </div>

      {stats?.activity && stats.activity.length > 0 && (
        <AdminCard title="Recent activity" description="Latest changes recorded in the CMS.">
          <ul className="space-y-2 text-sm">
            {stats.activity.map((log, i) => (
              <li key={`${log.created_at}-${i}`} className="flex justify-between gap-4 rounded-lg bg-surface-alt px-3 py-2">
                <span className="text-text">
                  <span className="font-medium">{log.action}</span>
                  {log.resource_type && <span className="text-text-muted"> · {log.resource_type}</span>}
                </span>
                <time className="shrink-0 text-xs text-text-muted">
                  {new Date(log.created_at).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      <AdminModal
        open={messagesOpen}
        onClose={() => setMessagesOpen(false)}
        title="New customer messages"
        description="Breakdown of unread or new items across channels."
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setMessagesOpen(false)}>
              Close
            </Button>
            <Link
              to="/admin/inquiries"
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Go to inquiries
            </Link>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-alt p-4 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-brand" />
            <p className="mt-2 text-2xl font-bold">{stats?.inquiriesNew ?? 0}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Product inquiries</p>
            <Link to="/admin/inquiries" className="mt-2 inline-block text-sm text-brand hover:underline">
              Open
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-surface-alt p-4 text-center">
            <Mail className="mx-auto h-6 w-6 text-brand" />
            <p className="mt-2 text-2xl font-bold">{stats?.contactNew ?? 0}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Contact form</p>
            <Link to="/admin/contact-messages" className="mt-2 inline-block text-sm text-brand hover:underline">
              Open
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-surface-alt p-4 text-center">
            <Wrench className="mx-auto h-6 w-6 text-brand" />
            <p className="mt-2 text-2xl font-bold">{stats?.serviceNew ?? 0}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Service requests</p>
            <Link to="/admin/service-inquiries" className="mt-2 inline-block text-sm text-brand hover:underline">
              Open
            </Link>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
