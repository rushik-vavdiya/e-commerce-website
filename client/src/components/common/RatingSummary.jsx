import StarRating from './StarRating';

// The rating strip above a list of reviews: the average and how many reviews were
// counted on the left, the 5-to-1 star breakdown on the right. Rendering it from
// real rows (never invented totals) is what keeps the numbers honest.
//
// Kept to one short band on purpose — it sits above the reviews, so it must not
// push them below the fold the way a tall sidebar card did.
//
//   <RatingSummary
//     average={4.5}
//     total={12}
//     breakdown={[{ value: 5, count: 8 }, ...]}
//     note="12 approved reviews loaded"
//   />
export default function RatingSummary({
  average = 0,
  total = 0,
  breakdown = [],
  note = null,
  loading = false,
  className = '',
}) {
  const shell = [
    'flex flex-col gap-3 rounded-2xl border border-border bg-white px-4 py-3.5',
    'sm:flex-row sm:items-center sm:gap-6 sm:px-5 sm:py-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <div className={shell} aria-busy="true">
        <div className="h-9 w-40 animate-pulse rounded-full bg-peach/50" />
        <div className="h-9 flex-1 animate-pulse rounded-full bg-peach/30" />
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="flex items-center gap-3 sm:min-w-[200px]">
        <span className="font-serif text-3xl font-medium leading-none text-primary">
          {total > 0 ? average.toFixed(1) : '—'}
        </span>

        <div className="min-w-0">
          <StarRating value={average} size={13} />

          {note && <p className="mt-1 text-[11px] leading-4 text-muted">{note}</p>}
        </div>
      </div>

      {total > 0 && (
        <ul className="grid flex-1 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          {breakdown.map(({ value, count }) => {
            const percent = total > 0 ? (count / total) * 100 : 0;

            return (
              <li key={value} className="flex items-center gap-2 text-[11px] text-muted">
                <span className="w-6 shrink-0 tabular-nums">{value}★</span>

                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-peach/30">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </span>

                <span className="w-4 shrink-0 text-right tabular-nums">{count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
