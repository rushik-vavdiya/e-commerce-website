import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import { changePassword, logoutUser } from '../../slices/authSlice';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../utils/authHelpers';
import { useToast } from '../notifications';

// Change password through PATCH /auth/change-password. A successful change bumps
// the account's token version, so every existing access token stops working —
// including the one in this browser. The form says so and signs the user out.
//
// Someone who cannot remember the current password is not stuck: the same
// "Forgot password?" link the sign-in form offers sends them through
// /forgot-password -> /reset-password, with this account's email already filled
// in. That flow also invalidates the token version, so it ends at /login too.
export default function ChangePasswordForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const userEmail = useSelector((state) => state.auth.user?.email ?? '');
  const toast = useToast();

  const [values, setValues] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!values.oldPassword) {
      nextErrors.oldPassword = 'Enter your current password.';
    }

    if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
      nextErrors.newPassword = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
    } else if (values.newPassword.length > PASSWORD_MAX_LENGTH) {
      nextErrors.newPassword = `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
    } else if (values.newPassword === values.oldPassword) {
      nextErrors.newPassword = 'The new password cannot be the current one.';
    }

    if (values.confirmPassword !== values.newPassword) {
      nextErrors.confirmPassword = 'The two passwords do not match.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await dispatch(
        changePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      ).unwrap();

      setValues({ oldPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(
        'Password changed. Every signed-in session was invalidated, so please sign in again.',
      );

      await dispatch(logoutUser());
      navigate('/login', {
        replace: true,
        state: { message: 'Password changed — please sign in with your new password.' },
      });
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-white p-5 sm:p-6"
    >
      {/* A rail on the left and the fields on the right: the inputs stay a
          comfortable reading width instead of stretching across the whole card,
          and the part that only needs reading has a column of its own. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col items-start gap-4">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-peach/30 text-accent">
            <ShieldCheck size={20} strokeWidth={1.7} aria-hidden="true" />
          </span>

          <div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
              Set a new password
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              At least {PASSWORD_MIN_LENGTH} characters, and not the one you use now.
            </p>
          </div>

          <p className="rounded-2xl border border-dashed border-peach bg-peach/25 px-3.5 py-2.5 text-[11px] leading-5 text-muted">
            This signs out every device, including this one. You will sign in again
            with the new password.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <AuthField
            label="Current password"
            name="current-password"
            type="password"
            icon={LockKeyhole}
            reveal
            autoComplete="current-password"
            value={values.oldPassword}
            onChange={handleChange('oldPassword')}
            error={fieldErrors.oldPassword}
            required
          />

          {/* Sits with the field it belongs to: a right-aligned link on the label
              row drifted a whole column away from the label it explained. */}
          <p className="text-xs text-muted">
            Cannot remember it?{' '}
            <Link
              to="/forgot-password"
              state={{ email: userEmail }}
              className="font-medium text-accent transition-colors hover:text-primary hover:underline"
            >
              Reset it by email
            </Link>
            .
          </p>

          {/* New and confirm sit side by side, each half as wide as the field
              above, so the pair reads as one decision. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="New password"
              name="new-password"
              type="password"
              icon={LockKeyhole}
              reveal
              autoComplete="new-password"
              value={values.newPassword}
              onChange={handleChange('newPassword')}
              error={fieldErrors.newPassword}
              hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
              required
            />

            <AuthField
              label="Confirm new password"
              name="confirm-password"
              type="password"
              icon={LockKeyhole}
              reveal
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={fieldErrors.confirmPassword}
              hint="Type the new password once more."
              required
            />
          </div>

          <div className="mt-1">
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Update password
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
