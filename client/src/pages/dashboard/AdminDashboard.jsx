import { Navigate, Route, Routes } from 'react-router-dom';

import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminCategories from '../admin/AdminCategories';
import AdminCustomers from '../admin/AdminCustomers';
import AdminNewsletter from '../admin/AdminNewsletter';
import AdminOrderDetail from '../admin/AdminOrderDetail';
import AdminOrders from '../admin/AdminOrders';
import AdminOverview from '../admin/AdminOverview';
import AdminProductEditor from '../admin/AdminProductEditor';
import AdminProducts from '../admin/AdminProducts';
import AdminReviews from '../admin/AdminReviews';
import AdminSettings from '../admin/AdminSettings';
import AdminVendors from '../admin/AdminVendors';

// Admin area. RoleRoute already guarantees an admin session before this renders,
// and every request below is authorised again by the backend for the same role.
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="mx-auto flex w-full max-w-[1900px] gap-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <Routes>
            <Route index element={<AdminOverview />} />

            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductEditor />} />
            <Route path="products/:productId/edit" element={<AdminProductEditor />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
