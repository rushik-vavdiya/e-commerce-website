import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import EmailVerificationCard from '../../components/profile/EmailVerificationCard';
import ProfileForm from '../../components/profile/ProfileForm';

// /account/profile — display and edit the fields PATCH /users/me accepts.
export default function PersonalInformation() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Your details"
        title="Personal information"
        description="Update your name, phone number and profile picture. Your email address is fixed, and you verify it below whenever you like."
      />

      <EmailVerificationCard />

      <ProfileForm />
    </div>
  );
}
