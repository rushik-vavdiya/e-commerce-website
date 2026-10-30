import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';
import { getContent } from '../../data/content';

// Copy lives in src/data/siteContent.json under "auth.register".
const copy = getContent('auth.register', {});

function Register() {
  return (
    <AuthLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <RegisterForm />
    </AuthLayout>
  );
}

export default Register;
