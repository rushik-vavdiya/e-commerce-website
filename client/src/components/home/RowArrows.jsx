import { ChevronLeft, ChevronRight } from 'lucide-react';

// The round prev/next pair the home rows share. A row passes what one press
// should do and whether there is still somewhere to go in each direction, so the
// buttons can disable themselves at the ends of the row.
//
//   <RowArrows label="products" onPrev={...} onNext={...} canPrev={...} canNext={...} />
const BUTTON_CLASS =
  'inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-white text-primary shadow-[0_10px_26px_-12px_rgba(122,46,31,0.45)] transition-colors duration-200 hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35';

export default function RowArrows({
  label,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  className = '',
}) {
  return (
    <div
      className={['flex items-center justify-end gap-2.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label={`Previous ${label}`}
        className={BUTTON_CLASS}
      >
        <ChevronLeft size={18} strokeWidth={1.9} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label={`Next ${label}`}
        className={BUTTON_CLASS}
      >
        <ChevronRight size={18} strokeWidth={1.9} aria-hidden="true" />
      </button>
    </div>
  );
}
