import { Loader2 } from 'lucide-react';

// One loading indicator for the whole app, so every wait looks the same.
//
// Inline (default): a small spinner that sits inside a button, a label row or a
// badge. `label` adds text next to it for screen readers and for the eye.
//
// Block: `block` centres the spinner in a panel with room around it, which is
// what a page or a drawer uses while its first request is in flight.
export default function Spinner({
  size = 18,
  label,
  block = false,
  className = '',
}) {
  if (block) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={[
          'flex flex-col items-center justify-center gap-3 px-4 py-14 text-center',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Loader2
          size={Math.max(size, 24)}
          strokeWidth={2}
          aria-hidden="true"
          className="animate-spin text-accent"
        />

        {label && <p className="text-sm text-muted">{label}</p>}
      </div>
    );
  }

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
      className={['inline-flex items-center gap-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Loader2
        size={size}
        strokeWidth={2}
        aria-hidden="true"
        className="animate-spin text-current"
      />

      {label && <span>{label}</span>}
    </span>
  );
}
