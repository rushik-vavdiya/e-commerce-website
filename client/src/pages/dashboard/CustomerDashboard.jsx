import { Navigate, Route, Routes } from 'react-router-dom';

import ProfileSidebar from '../../components/profile/ProfileSidebar';
import ProfileOverview from '../../components/profile/ProfileOverview';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import AddressSettings from '../profile/AddressSettings';
import MyOrders from '../profile/MyOrders';
import MyWishlist from '../profile/MyWishlist';
import PasswordSettings from '../profile/PasswordSettings';
import PersonalInformation from '../profile/PersonalInformation';
import PreferencesSettings from '../profile/PreferencesSettings';
import Settings from '../profile/Settings';
import WriteReview from '../profile/WriteReview';

// /account/* — the customer profile area: a sidebar on desktop, the same links in
// a menu on mobile, and one route per section.
export default function CustomerDashboard() {
  return (
    <StorefrontLayout>
      <div className="mx-auto flex w-full max-w-[1900px] gap-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <ProfileSidebar />

        <main className="min-w-0 flex-1">
          <Routes>
            <Route index element={<ProfileOverview />} />
            <Route path="profile" element={<PersonalInformation />} />
            <Route path="addresses" element={<AddressSettings />} />
            <Route path="password" element={<PasswordSettings />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="wishlist" element={<MyWishlist />} />
            <Route path="review" element={<WriteReview />} />
            <Route path="preferences" element={<PreferencesSettings />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/account" replace />} />
          </Routes>
        </main>
      </div>
    </StorefrontLayout>
  );
}
