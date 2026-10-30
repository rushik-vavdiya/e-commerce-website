import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MailCheck } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, requestPasswordReset } from '../../slices/authSlice';
import AuthAlert from './AuthAlert';
import { getContent } from '../../data/content';

// Wording lives in src/data/siteContent.json ("auth.resetCode").
const copy = getContent('auth.resetCode', {});

// After "Send reset link" this page says the link is in the inbox and can
// resend it. There is nothing to type here any more: the reset link itself
// lands on /reset-password/new-password?token=…, straight from the email.
function ResetPasswordOtpForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, message } = useSelector((state) => state.auth);

  const [email] = useState(location.state?.email ?? '');

  // Without an address there is nothing to reference — send the visitor
  // back to the step that asks for one.
  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);

  // POST /auth/forgot-password -> a fresh reset link (202, regardless).
  const handleResend = async () => {
    dispatch(clearAuthError());
    await dispatch(requestPasswordReset(email));
  };

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3.5">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-peach/60 text-primary"
        >
          <MailCheck size={18} strokeWidth={1.8} />
        </span>

        <div className="min-w-0 text-sm leading-6">
          <p className="text-muted">{copy.sentTo}</p>

          <p className="truncate font-medium text-primary">
            {email || copy.fallbackEmail}
          </p>

          <Link
            to="/forgot-password"
            state={{ email }}
            className="mt-1 inline-block text-xs font-semibold text-accent hover:underline"
          >
            {copy.differentEmail}
          </Link>
        </div>
      </div>

      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {!error && message && <AuthAlert variant="success">{message}</AuthAlert>}

      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleResend}
        disabled={loading || !email}
      >
        {copy.resend}
      </Button>

      <p className="text-center text-sm text-muted">
        {copy.remembered}{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          {copy.signIn}
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordOtpForm;
