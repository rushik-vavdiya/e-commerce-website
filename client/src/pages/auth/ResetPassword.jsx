import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordOtpForm from '../../components/auth/ResetPasswordOtpForm';
import { getContent } from '../../data/content';

// Step 1 of the password reset: the reset code only. The new password is a
// separate screen (/reset-password/new-password) so the two are never shown
// together. Copy lives in siteContent under "auth.resetCode".
const copy = getContent('auth.resetCode', {});

function ResetPassword() {
  return (
    <AuthLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <ResetPasswordOtpForm />
    </AuthLayout>
  );
}

export default ResetPassword;
