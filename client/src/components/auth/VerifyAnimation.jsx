// Animated state shown while an OTP is being checked and once it is accepted.
// The form is replaced by this panel, so only the verification is on screen.
//
// - state "verifying": a spinning ring with a soft pulsing halo.
// - state "verified": the ring settles into a badge and the check draws itself.
//
// The four fallback lines come from siteContent ("auth.verifyAnimation").
import { getContent } from '../../data/content';

const copy = getContent('auth.verifyAnimation', {});

export default function VerifyAnimation({
  state = 'verifying',
  title,
  message,
  className = '',
}) {
  const isVerified = state === 'verified';

  return (
    <div
      role="status"
      aria-live="polite"
      className={['flex flex-col items-center gap-6 py-10 text-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="relative flex size-20 items-center justify-center">
        {/* Pulsing halo behind the badge. */}
        {!isVerified && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-peach/70 motion-safe:animate-verify-ring"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-peach/50 motion-safe:animate-verify-ring"
              style={{ animationDelay: '400ms' }}
            />
          </>
        )}

        {isVerified ? (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-accent/25 motion-safe:animate-verify-ring"
            />

            <span className="relative flex size-20 items-center justify-center rounded-full bg-accent text-white shadow-[0_14px_36px_-12px_rgba(122,46,31,0.55)] motion-safe:animate-pop">
              <svg
                viewBox="0 0 24 24"
                className="size-10"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path
                  d="m5 13 4 4 10-10"
                  className="motion-safe:animate-check-draw"
                  style={{ strokeDasharray: 32, strokeDashoffset: 32 }}
                />
              </svg>
            </span>
          </>
        ) : (
          <span
            aria-hidden="true"
            className="relative flex size-20 items-center justify-center rounded-full border-4 border-peach border-t-accent motion-safe:animate-spin"
          />
        )}
      </span>

      <div className="max-w-xs">
        <p className="font-serif text-xl font-medium tracking-tight text-primary sm:text-2xl">
          {title ??
            (isVerified ? copy.verifiedTitle : copy.verifyingTitle)}
        </p>

        {isVerified ? (
          <p className="mt-2 text-sm leading-6 text-muted">
            {message ?? copy.verifiedMessage}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-muted">
            {message ?? copy.verifyingMessage}
          </p>
        )}
      </div>
    </div>
  );
}
