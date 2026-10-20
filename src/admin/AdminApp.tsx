import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AdminLayout } from './AdminLayout'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminRegisterPage } from './pages/AdminRegisterPage'
import { AdminPendingPage } from './pages/AdminPendingPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { AdminProductEditPage } from './pages/AdminProductEditPage'
import { AdminCollectionsPage } from './pages/AdminCollectionsPage'
import { AdminBrandsPage } from './pages/AdminBrandsPage'
import { AdminInquiriesPage } from './pages/AdminInquiriesPage'
import { AdminContactPage } from './pages/AdminContactPage'
import { AdminServicePage } from './pages/AdminServicePage'
import { AdminPartnersPage } from './pages/AdminPartnersPage'
import { AdminPageSectionsPage } from './pages/AdminPageSectionsPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminAccountPage } from './pages/AdminAccountPage'
import { useAdminAccess } from './useAdminAccess'

function RequireApprovedStaff({ children }: { children: ReactNode }) {
  const { session, loading, canAccessCms, isPending, isRejected } = useAdminAccess()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-text-muted">Loading…</div>
  }
  if (!session) return <Navigate to="/admin/login" replace />
  if (isPending) return <Navigate to="/admin/pending" replace />
  if (isRejected) {
    void supabase.auth.signOut()
    return <Navigate to="/admin/login" replace state={{ rejected: true }} />
  }
  if (!canAccessCms) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="max-w-md text-sm text-text-muted">
          Your account does not have CMS access. Contact an administrator.
        </p>
      </div>
    )
  }
  return children
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route path="register" element={<AdminRegisterPage />} />
      <Route path="pending" element={<AdminPendingPage />} />
      <Route
        path="*"
        element={
          <RequireApprovedStaff>
            <AdminLayout />
          </RequireApprovedStaff>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/:id" element={<AdminProductEditPage />} />
        <Route path="collections" element={<AdminCollectionsPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="inquiries" element={<AdminInquiriesPage />} />
        <Route path="contact-messages" element={<AdminContactPage />} />
        <Route path="service-inquiries" element={<AdminServicePage />} />
        <Route path="media" element={<Navigate to="/admin/products" replace />} />
        <Route path="partners-clients" element={<AdminPartnersPage />} />
        <Route path="page-sections" element={<AdminPageSectionsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="account" element={<AdminAccountPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  )
}
