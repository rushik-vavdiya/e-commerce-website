import { Loader2 } from 'lucide-react';

// Overlay for an image thumbnail while its upload is in flight, so the picture
// being sent is visibly busy instead of looking idle.
//
// The element it is dropped into must be positioned (relative) — it fills it
// and inherits its corner radius.
export default function UploadSpinner({
  label = 'Uploading',
  size = 22,
  className = '',
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={[
        'absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-[inherit] bg-primary/55 backdrop-blur-[2px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Loader2
        size={size}
        strokeWidth={2.2}
        aria-hidden="true"
        className="animate-spin text-white"
      />

      {label && (
        <span className="px-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
          {label}
        </span>
      )}
    </span>
  );
}
