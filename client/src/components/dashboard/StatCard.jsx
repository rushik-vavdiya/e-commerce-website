// Small metric tile shared by the admin and vendor dashboards.
// `caption` is where a number's real meaning is spelled out (for example the
// fact that a total only covers the rows the API returned).
export default function StatCard({
  label,
  value,
  Icon,
  caption,
  loading = false,
  className = '',
}) {
  return (
    <article
      className={[
        'flex h-full flex-col gap-3 rounded-3xl border border-border bg-white p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </p>

        {Icon && (
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-peach bg-peach/40 text-primary"
          >
            <Icon size={17} strokeWidth={1.8} />
          </span>
        )}
      </div>

      {loading ? (
        <span className="h-8 w-20 animate-pulse rounded-full bg-peach/50" />
      ) : (
        <p className="font-serif text-3xl font-medium leading-none text-primary">
          {value === null || value === undefined ? '—' : value}
        </p>
      )}

      {caption && <p className="mt-auto text-xs leading-5 text-muted">{caption}</p>}
    </article>
  );
}
