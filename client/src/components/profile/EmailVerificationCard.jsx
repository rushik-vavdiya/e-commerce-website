import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BadgeCheck, Mail, MailCheck } from 'lucide-react';

import Button from '../common/Button';
import StatusPill from '../dashboard/StatusPill';
import {
  clearAuthError,
  clearAuthMessage,
  resendVerificationCode,
} from '../../slices/authSlice';
import { useToast } from '../notifications';

// Optional email verification for a signed-in account.
//
// Signing in no longer depends on this step, so it lives here instead of in the
// login flow: the address comes from the session and POST
// /auth/resend-verification mails a one-time link to it. The account confirms
// itself when that link is opened, and the badge flips on the next session
// refresh.
//
// Laid out like the change-password card next to it: what the section is about
// sits in a narrow rail, and the action keeps a comfortable width instead of
// stretching across the whole card.
export default function EmailVerificationCard() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const [sending, setSending] = useState(false);

  const toast = useToast();

  const email = user?.email ?? '';
  const isVerified = Boolean(user?.emailVerified);

  const handleSendLink = async () => {
    dispatch(clearAuthError());
    dispatch(clearAuthMessage());
    setSending(true);

    // POST /auth/resend-verification -> { email }
    try {
      await dispatch(resendVerificationCode(email)).unwrap();
      toast.success(`A verification link is on its way to ${email}. Open it to confirm this address.`);
    } catch (failure) {
      toast.error(String(failure));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
        {/* Rail: what this section is for */}
        <div className="flex flex-col items-start gap-4">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-peach/30 text-accent">
            <MailCheck size={20} strokeWidth={1.7} aria-hidden="true" />
          </span>

          <div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
              Email verification
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Confirming your address is optional — you can do it any time from
              here.
            </p>
          </div>

          <StatusPill
            value={isVerified ? 'verified' : 'unverified'}
            label={isVerified ? 'email verified' : 'email not verified'}
            tone={isVerified ? 'success' : 'warning'}
          />
        </div>

        {/* The address and the action */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-dashed border-peach bg-peach/25 px-4 py-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <Mail size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-accent" />
              <span className="truncate text-sm font-medium text-primary">
                {email || 'No email on this account'}
              </span>
            </span>

            {isVerified ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <BadgeCheck size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
                Verified
              </span>
            ) : (
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                Not verified
              </span>
            )}
          </div>

          {isVerified ? (
            <p className="text-xs leading-5 text-muted">
              This address is confirmed. Nothing else to do here.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="primary"
                loading={sending}
                onClick={handleSendLink}
                disabled={sending || !email}
              >
                Send verification link
              </Button>

              <span className="text-xs leading-5 text-muted">
                The link expires in 30 minutes and works once.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
