import AuthLayout from '../../components/auth/AuthLayout';
import OtpVerificationForm from '../../components/auth/OtpVerificationForm';
import { getContent } from '../../data/content';

// Also the OTP step for sign-up: the backend only supports email codes
// (there is no phone verification endpoint). Copy lives in siteContent under
// "auth.verify".
const copy = getContent('auth.verify', {});

function OtpVerification() {
  return (
    <AuthLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <OtpVerificationForm />
    </AuthLayout>
  );
}

export default OtpVerification;
