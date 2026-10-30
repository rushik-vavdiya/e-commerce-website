import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';

// One notification. The variant decides the icon, the accent stripe and the
// colour of the message, so a success and an error never look alike.
const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    title: 'Success',
    role: 'status',
    stripe: 'bg-emerald-500',
    progress: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-600',
  },
  error: {
    Icon: XCircle,
    title: 'Something went wrong',
    role: 'alert',
    stripe: 'bg-red-500',
    progress: 'bg-red-500',
    chip: 'bg-red-50 text-red-600',
  },
  warning: {
    Icon: TriangleAlert,
    title: 'Heads up',
    role: 'status',
    stripe: 'bg-amber-500',
    progress: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-600',
  },
  info: {
    Icon: Info,
    title: 'Notice',
    role: 'status',
    stripe: 'bg-accent',
    progress: 'bg-accent',
    chip: 'bg-peach/45 text-primary',
  },
};

const EXIT_MS = 200;

export default function Toast({ toast, onDismiss }) {
  const { id, variant, duration } = toast;
  const style = VARIANTS[variant] ?? VARIANTS.info;
  const { Icon } = style;
  const title = toast.title ?? style.title;

  // "entering" renders off-screen first, so the card slides in instead of
  // appearing already in place.
  const [phase, setPhase] = useState('entering');
  const [hovered, setHovered] = useState(false);
  const elapsed = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPhase('open'));
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = useCallback(() => {
    setPhase('leaving');
    window.setTimeout(() => onDismiss(id), EXIT_MS);
  }, [id, onDismiss]);

  // Auto-dismiss, with the clock stopped while the pointer is over the card so a
  // message can be read without chasing it.
  useEffect(() => {
    if (hovered || phase === 'leaving') return undefined;

    const startedAt = Date.now();
    const remaining = Math.max(duration - elapsed.current, 300);
    const timer = window.setTimeout(close, remaining);

    return () => {
      window.clearTimeout(timer);
      elapsed.current += Date.now() - startedAt;
    };
  }, [hovered, phase, duration, close]);

  return (
    <li
      role={style.role}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        'pointer-events-auto group relative w-full overflow-hidden rounded-2xl border border-border bg-white',
        'shadow-[0_20px_45px_-18px_rgba(122,46,31,0.45)] transition-all duration-200 ease-out',
        phase === 'open'
          ? 'translate-x-0 opacity-100'
          : 'translate-x-6 opacity-0',
      ].join(' ')}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${style.stripe}`} />

      <div className="flex items-start gap-3 py-3.5 pl-5 pr-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${style.chip}`}
        >
          <Icon size={17} strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 text-primary">{title}</p>
          <p className="mt-0.5 break-words text-xs leading-5 text-muted">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-peach/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* The bar drains with the same duration as the timer and pauses with the
          pointer, so it stays an honest countdown. */}
      <span
        aria-hidden="true"
        className={`block h-0.5 w-full origin-left animate-toast-progress ${style.progress} opacity-80 group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </li>
  );
}
