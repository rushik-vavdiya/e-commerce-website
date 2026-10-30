import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import RoleRoute from './components/routing/RoleRoute'
import ScrollToTop from './components/routing/ScrollToTop'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Logout from './pages/auth/Logout'
import OtpVerification from './pages/auth/OtpVerification'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import ResetPasswordNewPassword from './pages/auth/ResetPasswordNewPassword'
import Home from './pages/home/Home'
import NotFound from './pages/common/NotFound'
import Unauthorized from './pages/common/Unauthorized'
import About from './pages/about/About'
import Contact from './pages/contact/Contact'
import FAQ from './pages/faq/FAQ'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import Product from './pages/product/Product'
import Checkout from './pages/shop/Checkout'
import OrderDetail from './pages/shop/OrderDetail'
import OrderSuccess from './pages/shop/OrderSuccess'
import ProductDetail from './pages/shop/ProductDetail'
import Search from './pages/search/Search'
import Wishlist from './pages/wishlist/Wishlist'
import VendorApplication from './pages/vendor/VendorApplication'
import VendorPreview from './pages/vendor/VendorPreview'
import { selectVendorSystemEnabled } from './slices/siteSettingsSlice'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import CustomerDashboard from './pages/dashboard/CustomerDashboard'
import VendorDashboard from './pages/dashboard/VendorDashboard'

// /categories/kurti-1-piece -> /shop?category=kurti-1-piece
const CategoryRedirect = () => {
  const { slug = '' } = useParams()

  return <Navigate to={`/shop?category=${encodeURIComponent(slug)}`} replace />
}

// Vendor pages only exist while the admin has the vendor system switched on.
// With it off the address behaves like any other unknown page.
const VendorOnly = ({ children }) => {
  const vendorSystemEnabled = useSelector(selectVendorSystemEnabled)

  return vendorSystemEnabled ? children : <NotFound />
}

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Every page starts at the top; back and forward keep their position. */}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Storefront browsing. Products and categories come from the real
            backend API through the products and categories slices. */}
        <Route path="/shop" element={<Product />} />
        <Route path="/products" element={<Product />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        {/* A category is a filter on the collection page, not a page of its own,
            so the old links keep working by turning into that filter. */}
        <Route path="/categories" element={<Navigate to="/shop" replace />} />
        <Route path="/categories/:slug" element={<CategoryRedirect />} />
        {/* The Collections mega menu links here. A department is a filter on the
            shop page, not a page of its own, so both addresses forward to it. */}
        <Route path="/collections" element={<Navigate to="/shop" replace />} />
        <Route path="/collections/:slug" element={<CategoryRedirect />} />
        {/* One page for the navbar search: products from the API plus live
            categories and the storefront's own pages. */}
        <Route path="/search" element={<Search />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Checkout and the orders it creates. Customers only: orders belong to an
            account, and the API checks that on every request too. */}
        <Route
          path="/checkout"
          element={
            <RoleRoute allowedRoles={['customer']}>
              <Checkout />
            </RoleRoute>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <RoleRoute allowedRoles={['customer']}>
              <OrderSuccess />
            </RoleRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <RoleRoute allowedRoles={['customer']}>
              <OrderDetail />
            </RoleRoute>
          }
        />

        {/* Static storefront pages */}
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Public authentication flow */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<OtpVerification />} />
        {/* Password reset is two separate screens: the code first, then the
            new password. They are never shown together on one page. */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/new-password" element={<ResetPasswordNewPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Vendor dashboard UI preview. Public and demo-data only: it never
            reaches the vendor API and /vendor below keeps its role check. */}
        <Route
          path="/vendor-preview"
          element={
            <VendorOnly>
              <VendorPreview />
            </VendorOnly>
          }
        />

        {/* Vendor application. Public on purpose: a signed-in customer is exactly
            who needs it, and /vendor/* below stays restricted to vendor accounts. */}
        <Route
          path="/vendor/apply"
          element={
            <VendorOnly>
              <VendorApplication />
            </VendorOnly>
          }
        />

        {/* Role based areas (guarded by the existing auth slice) */}
        <Route
          path="/admin/*"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/vendor/*"
          element={
            <RoleRoute allowedRoles={['vendor']}>
              <VendorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/account/*"
          element={
            <RoleRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </RoleRoute>
          }
        />

        {/* A real not-found page. The catch-all used to redirect to the
            homepage, which made dead links look like the click was ignored. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
