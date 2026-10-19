import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  MessageSquare,
  Image,
  Users,
  Settings,
  Wrench,
  Mail,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import { COMPANY } from '@/lib/constants'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/collections', label: 'Collections', icon: FolderTree },
  { to: '/admin/brands', label: 'Brands', icon: Tags },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { to: '/admin/contact-messages', label: 'Contact', icon: Mail },
  { to: '/admin/service-inquiries', label: 'Service', icon: Wrench },
  { to: '/admin/media', label: 'Media', icon: Image },
  { to: '/admin/partners-clients', label: 'Partners & Clients', icon: Users },
  { to: '/admin/page-sections', label: 'Homepage', icon: LayoutDashboard },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-[#f0f1f3]">
      <aside className="hidden w-[17.5rem] shrink-0 flex-col border-r border-white/10 bg-surface-dark text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-6">
          <Link to="/" className="group flex items-center gap-2 text-xs text-white/60 transition-colors hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" />
            View public site
          </Link>
          <div className="mt-5 rounded-lg bg-white px-3 py-2.5">
            <img
              src="/logo.png"
              alt={COMPANY.name}
              className="h-auto w-full max-w-[10.5rem] object-contain"
            />
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-brand">Admin CMS</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Admin">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brand font-medium text-white shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={async () => {
              await supabase.auth.signOut()
              navigate('/admin/login')
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="" className="h-9 w-auto max-w-[8rem] object-contain" />
            <span className="text-sm font-semibold text-text">Admin</span>
          </div>
          <p className="hidden text-sm text-text-muted lg:block">
            {COMPANY.name} — content management
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline lg:hidden"
            onClick={async () => {
              await supabase.auth.signOut()
              navigate('/admin/login')
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
