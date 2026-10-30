import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockKeyhole } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, resetPasswordWithToken } from '../../slices/authSlice';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';
import { getContent } from '../../data/content';
import { fill } from '../../utils/text';

// Wording lives in src/data/siteContent.json ("auth.resetNew").
const copy = getContent('auth.resetNew', {});
const errorsCopy = copy.errors ?? {};

// The last step of the reset: the new password. The one-time token arrives in
// the URL of the emailed link (/reset-password/new-password?token=…), so there
// is nothing else to enter here.
function ResetPasswordForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const token = new URLSearchParams(location.search).get('token') ?? '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Opening the screen without the emailed token is a stale bookmark or a
  // mistyped address — start the flow again instead of submitting nothing.
  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (formData.newPassword.length < PASSWORD_MIN_LENGTH) {
      nextErrors.newPassword = fill(errorsCopy.passwordMin, {
        min: PASSWORD_MIN_LENGTH,
      });
    } else if (formData.newPassword.length > PASSWORD_MAX_LENGTH) {
      nextErrors.newPassword = fill(errorsCopy.passwordMax, {
        max: PASSWORD_MAX_LENGTH,
      });
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = errorsCopy.confirmRequired;
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = errorsCopy.mismatch;
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    const nextErrors = validate();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      // POST /auth/reset-password -> { token, newPassword }
      await dispatch(
        resetPasswordWithToken({
          token,
          newPassword: formData.newPassword,
        }),
      ).unwrap();

      navigate('/login', {
        replace: true,
        state: { message: copy.success },
      });
    } catch {
      // The failure message is rendered from the Redux auth state below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted">
        <LockKeyhole
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-accent"
        />
        <span>
          {copy.accepted}
          {copy.acceptedTail}
        </span>
      </p>

      <AuthField
        label={copy.newPassword}
        name="newPassword"
        type="password"
        icon={LockKeyhole}
        reveal
        autoFocus
        placeholder={copy.newPasswordPlaceholder}
        autoComplete="new-password"
        value={formData.newPassword}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.newPassword}
        hint={fill(copy.newPasswordHint, { min: PASSWORD_MIN_LENGTH })}
        required
      />

      <AuthField
        label={copy.confirm}
        name="confirmPassword"
        type="password"
        icon={LockKeyhole}
        reveal
        placeholder={copy.confirmPlaceholder}
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.confirmPassword}
        required
      />

      {error && (
        <>
          <AuthAlert variant="error">{error}</AuthAlert>

          <p className="text-xs text-muted">
            {copy.rejected}{' '}
            <Link to="/forgot-password" className="font-semibold text-accent hover:underline">
              {copy.goBack}
            </Link>
            .
          </p>
        </>
      )}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        {copy.submit}
      </Button>
    </form>
  );
}

export default ResetPasswordForm;
