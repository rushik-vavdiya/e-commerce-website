import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, LogOut, Mail, ShieldAlert } from 'lucide-react';

import StatusPill from '../dashboard/StatusPill';
import Button from '../common/Button';
import { logoutUser } from '../../slices/authSlice';
import { removeAccount } from '../../slices/userSlice';
import { useToast } from '../notifications';

// Account settings. Two things are worth being exact about:
// - Deactivation is an admin action (PATCH /admin/users/:userId/status), so a
//   customer cannot switch their own account to inactive.
// - What a customer *can* do is DELETE /users/me, which permanently removes the
//   account, so it sits behind an explicit two-step confirmation.
//
// The page is two short cards side by side — status and session — then the one
// destructive action on its own, so "delete" never sits in the same row as a
// button people press every day.
export default function AccountSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.user);

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const handleDelete = async () => {
    try {
      await dispatch(removeAccount()).unwrap();
      await dispatch(logoutUser());
      toast.success('Your account was deleted.');
      navigate('/', { replace: true });
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col rounded-3xl border border-border bg-white p-5 sm:p-6">
          <h2 className="text-base font-medium text-primary">Account status</h2>
          <p className="mt-0.5 text-xs text-muted">
            What the backend returned for this account.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusPill value={user?.status} />
            <StatusPill
              value={user?.emailVerified ? 'verified' : 'unverified'}
              label={user?.emailVerified ? 'email verified' : 'email not verified'}
              tone={user?.emailVerified ? 'success' : 'warning'}
            />
          </div>

          {/* Pinned to the bottom so the pair of cards lines up. */}
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-peach bg-peach/25 px-4 py-3 lg:mt-auto">
            <Mail size={17} strokeWidth={1.7} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs leading-5 text-muted">
              To pause the account, ask support: only an administrator can deactivate it.
            </p>
          </div>
        </section>

        <section className="flex flex-col rounded-3xl border border-border bg-white p-5 sm:p-6">
          <h2 className="text-base font-medium text-primary">Session</h2>
          <p className="mt-0.5 text-xs text-muted">
            Signing out ends this session on the server as well as in this browser.
          </p>

          <div className="mt-4 lg:mt-auto">
            <Button type="button" variant="outline" onClick={handleSignOut}>
              <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
              Sign out of this device
            </Button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-red-200 bg-red-50/60 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-medium text-red-800">
          <ShieldAlert size={18} strokeWidth={1.8} aria-hidden="true" />
          Delete account
        </h2>

        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-red-800/90">
          This removes your account and your profile picture for good. Past orders and
          their records stay on file.
        </p>

        {confirmOpen ? (
          <div className="mt-4 rounded-2xl border border-red-300 bg-white p-4">
            <p className="flex items-start gap-2 text-xs leading-5 text-red-800">
              <AlertTriangle size={16} strokeWidth={1.9} aria-hidden="true" className="mt-0.5 shrink-0" />
              Type <span className="font-semibold">DELETE</span> below to confirm. This
              cannot be undone.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              aria-label="Type DELETE to confirm"
              className="mt-3 min-h-11 w-full rounded-xl border border-red-300 bg-white px-4 text-sm text-primary outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="danger"
                loading={loading}
                disabled={loading || confirmText !== 'DELETE'}
                onClick={handleDelete}
              >
                Delete my account
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete account…
            </Button>
          </div>
        )}

      </section>
    </div>
  );
}
