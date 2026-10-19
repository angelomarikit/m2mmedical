import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { AdminProductEditPage } from './pages/AdminProductEditPage'
import { AdminCollectionsPage } from './pages/AdminCollectionsPage'
import { AdminBrandsPage } from './pages/AdminBrandsPage'
import { AdminInquiriesPage } from './pages/AdminInquiriesPage'
import { AdminContactPage } from './pages/AdminContactPage'
import { AdminServicePage } from './pages/AdminServicePage'
import { AdminMediaPage } from './pages/AdminMediaPage'
import { AdminPartnersPage } from './pages/AdminPartnersPage'
import { AdminPageSectionsPage } from './pages/AdminPageSectionsPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { useAdminSession } from './useAdminSession'

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAdminSession()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading…</div>
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route
        path="*"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
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
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="partners-clients" element={<AdminPartnersPage />} />
        <Route path="page-sections" element={<AdminPageSectionsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  )
}
