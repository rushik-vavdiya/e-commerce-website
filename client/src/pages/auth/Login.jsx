import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import { getContent } from '../../data/content';

// Copy lives in src/data/siteContent.json under "auth.login".
const copy = getContent('auth.login', {});

function Login() {
  return (
    <AuthLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default Login;
