import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { ProductsPage } from '@/pages/ProductsPage'
import { CollectionDetailPage } from '@/pages/CollectionDetailPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { AboutPage } from '@/pages/AboutPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { ContactPage } from '@/pages/ContactPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { InquirySuccessPage } from '@/pages/InquirySuccessPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const AdminApp = lazy(() => import('@/admin/AdminApp'))

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-text-muted">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={
          <Suspense fallback={<PageLoader />}>
            <AdminApp />
          </Suspense>
        } />
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="collections/:slug" element={<CollectionDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="inquiry/success" element={<InquirySuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
