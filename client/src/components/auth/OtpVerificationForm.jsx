import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail } from 'lucide-react';

import Button from '../common/Button';
import {
  clearAuthError,
  resendVerificationCode,
  verifyEmailToken,
} from '../../slices/authSlice';
import { isEmail } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';
import VerifyAnimation from './VerifyAnimation';
import { getContent } from '../../data/content';
import { fill } from '../../utils/text';

// Wording lives in src/data/siteContent.json ("auth.verify" and "auth.shared").
const copy = getContent('auth.verify', {});
const shared = getContent('auth.shared', {});
const errorsCopy = copy.errors ?? {};

// The inbox email is the one-time link the backend mailed — this page consumes
// it, and offers a fresh link when it has expired or when a visitor arrives
// straight after registering.
function OtpVerificationForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  // The token comes from the verification email: /verify-email?token=…
  const queryToken = new URLSearchParams(location.search).get('token');

  // Registration hands over the address for the "request a new link" form.
  const [email, setEmail] = useState(location.state?.email ?? '');
  const [fieldError, setFieldError] = useState('');
  const [linkSent, setLinkSent] = useState('');
  // 'idle' | 'verifying' | 'verified' — the form is replaced while verifying.
  const [status, setStatus] = useState(queryToken ? 'verifying' : 'idle');

  const startedRef = useRef(false);

  // Consume the emailed link once. StrictMode mounts effects twice in
  // development, so a ref keeps the request single-shot.
  useEffect(() => {
    if (!queryToken || startedRef.current) return undefined;

    startedRef.current = true;

    // POST /auth/verify-email -> { token }
    dispatch(verifyEmailToken(queryToken))
      .unwrap()
      .then(() => setStatus('verified'))
      .catch(() => setStatus('idle'));

    return undefined;
  }, [queryToken, dispatch]);

  // Hand off to the sign-in page once the success animation has played.
  useEffect(() => {
    if (status !== 'verified') return undefined;

    const timer = setTimeout(() => {
      navigate('/login', {
        replace: true,
        state: {
          email: email.trim(),
          message: copy.success,
        },
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [status, email, navigate]);

  const handleResend = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());
    setLinkSent('');

    if (!email.trim()) {
      setFieldError(errorsCopy.emailRequired);
      return;
    }
    if (!isEmail(email)) {
      setFieldError(errorsCopy.emailInvalid);
      return;
    }
    setFieldError('');

    // POST /auth/resend-verification -> { email }
    try {
      await dispatch(resendVerificationCode(email.trim())).unwrap();
      setLinkSent(fill(copy.linkSent, { email: email.trim() }));
    } catch {
      // The resend failure is displayed from the Redux auth state.
    }
  };

  if (status !== 'idle') {
    return <VerifyAnimation state={status} />;
  }

  const notice = location.state?.message;

  return (
    <form onSubmit={handleResend} noValidate className="flex flex-col gap-4">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {!error && notice && <AuthAlert variant="info">{notice}</AuthAlert>}
      {!error && !notice && linkSent && (
        <AuthAlert variant="success">{linkSent}</AuthAlert>
      )}

      <div>
        <h3 className="text-sm font-semibold text-primary">{copy.resendTitle}</h3>
        <p className="mt-1 text-xs leading-5 text-muted">{copy.resendSubtitle}</p>
      </div>

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
      />

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        {copy.resend}
      </Button>

      <p className="text-center text-sm text-muted">
        {copy.wrongEmail}{' '}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          {copy.registerAgain}
        </Link>{' '}
        {copy.or}{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          {copy.signIn}
        </Link>
        .
      </p>
    </form>
  );
}

export default OtpVerificationForm;
