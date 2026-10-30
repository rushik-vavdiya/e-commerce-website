import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import { getContent } from '../../data/content';

// Step 2 of the password reset: the new password on its own, with no code
// field, since the code was verified on the previous screen. Copy lives in
// siteContent under "auth.resetNew".
const copy = getContent('auth.resetNew', {});

function ResetPasswordNewPassword() {
  return (
    <AuthLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default ResetPasswordNewPassword;
