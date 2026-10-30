import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';

// /account/password
export default function PasswordSettings() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Security"
        title="Change password"
        description="Confirm it is you with your current password, then choose the new one."
      />

      <ChangePasswordForm />
    </div>
  );
}
