import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import ProfileForm from '../../components/profile/ProfileForm';

// Vendor account settings. The same account endpoints the customer profile uses
// (GET/PATCH /users/me and PATCH /auth/change-password), so the same components
// are reused rather than rebuilt for the vendor role.
export default function VendorSettings() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Account"
        title="Account settings"
        description="Sign-in details for the person behind the store. Store details live on the store profile page."
      />

      <div className="flex flex-col gap-6">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
