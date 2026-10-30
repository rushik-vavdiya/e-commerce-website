import AuthLayout from '../../components/auth/AuthLayout';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { getContent } from '../../data/content';

// Copy lives in src/data/siteContent.json under "auth.forgot".
const copy = getContent('auth.forgot', {});

function ForgotPassword() {
  return (
    <AuthLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export default ForgotPassword;
