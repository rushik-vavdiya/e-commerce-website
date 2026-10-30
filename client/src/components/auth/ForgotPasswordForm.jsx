import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, requestPasswordReset } from '../../slices/authSlice';
import { isEmail } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';
import { getContent } from '../../data/content';

// Wording lives in src/data/siteContent.json ("auth.forgot" and "auth.shared").
const copy = getContent('auth.forgot', {});
const shared = getContent('auth.shared', {});
const errorsCopy = copy.errors ?? {};

function ForgotPasswordForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  // Prefilled when this is reached from the account area ("Forgot password?" on
  // the change-password form hands over the signed-in address), or from a link
  // such as /forgot-password?email=you@example.com.
  const queryEmail = new URLSearchParams(location.search).get('email') ?? '';
  const [email, setEmail] = useState(location.state?.email ?? queryEmail);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    if (!email.trim()) {
      setFieldError(errorsCopy.emailRequired);
      return;
    }

    if (!isEmail(email)) {
      setFieldError(errorsCopy.emailInvalid);
      return;
    }

    setFieldError('');

    try {
      // POST /auth/forgot-password always answers 202 for privacy.
      await dispatch(requestPasswordReset(email.trim())).unwrap();
      navigate('/reset-password', { state: { email: email.trim() } });
    } catch {
      // The failure message is rendered from the Redux auth state below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthField
        label={shared.emailLabel}
        name="email"
        type="email"
        icon={Mail}
        placeholder={shared.emailPlaceholder}
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={loading}
        error={fieldError}
        hint={copy.hint}
        required
      />

      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        {copy.submit}
      </Button>

      <p className="text-center text-sm text-muted">
        {copy.remembered}{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          {copy.backToSignIn}
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
