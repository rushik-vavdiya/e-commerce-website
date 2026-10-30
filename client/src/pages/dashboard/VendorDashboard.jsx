import { Navigate, Route, Routes } from 'react-router-dom';

import VendorHeader from '../../components/vendor/VendorHeader';
import VendorSidebar from '../../components/vendor/VendorSidebar';
import VendorOverview from '../vendor/VendorOverview';
import VendorProductEditor from '../vendor/VendorProductEditor';
import VendorProducts from '../vendor/VendorProducts';
import VendorReviews from '../vendor/VendorReviews';
import VendorSettings from '../vendor/VendorSettings';
import VendorStoreProfile from '../vendor/VendorStoreProfile';

// Real vendor area, reached only by an account whose role is vendor (RoleRoute)
// and whose application an admin approved. The UI preview for inspecting the
// layout without approval is the separate public /vendor-preview route.
export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <VendorHeader />

      <div className="mx-auto flex w-full max-w-[1900px] gap-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <VendorSidebar />

        <main className="min-w-0 flex-1">
          <Routes>
            <Route index element={<VendorOverview />} />
            <Route path="products" element={<VendorProducts />} />
            <Route path="products/new" element={<VendorProductEditor />} />
            <Route path="products/:productId/edit" element={<VendorProductEditor />} />
            <Route path="reviews" element={<VendorReviews />} />
            <Route path="profile" element={<VendorStoreProfile />} />
            <Route path="settings" element={<VendorSettings />} />
            <Route path="*" element={<Navigate to="/vendor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
