import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import Preferences from '../../components/profile/Preferences';

// /account/preferences — newsletter opt-in and small display settings.
export default function PreferencesSettings() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Account"
        title="Preferences"
        description="Newsletter opt-in and a couple of display options for your account."
      />

      <Preferences />
    </div>
  );
}
