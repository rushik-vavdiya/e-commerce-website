import AccountSettings from '../../components/profile/AccountSettings';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';

// /account/settings — account status, session control and account deletion, all
// limited to what the existing customer endpoints actually support.
export default function Settings() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Account"
        title="Account settings"
        description="Status comes from the backend. This page only offers actions the existing API supports."
      />

      <AccountSettings />
    </div>
  );
}
