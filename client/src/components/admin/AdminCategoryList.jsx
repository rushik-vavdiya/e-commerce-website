import StatusPill from '../dashboard/StatusPill';

// Category management list. Deleting is refused by the API while a category is
// still used by products or child categories, and that message is shown as-is.
export default function AdminCategoryList({
  categories = [],
  loading = false,
  error = null,
  onToggleStatus,
  onDelete,
  onEdit,
  busyId = null,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-3xl border border-border bg-white/60" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
        No categories yet. Create the first one to start adding products.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {categories.map((category) => {
        const busy = busyId === category._id;

        return (
          <li
            key={category._id}
            className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5"
          >
            {/* The cover image the homepage circle uses, so a category with no
                photo is obvious from this list. */}
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-peach/25">
              {category.image ? (
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
                  No image
                </span>
              )}
            </span>

            <div className="min-w-0 sm:flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-medium text-primary">
                  {category.name}
                </h3>
                <StatusPill value={category.status} />
                <span className="text-[11px] text-muted">
                  level {category.level ?? 0} · /{category.slug}
                </span>
              </div>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                {category.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onEdit?.(category)}
                className="inline-flex min-h-9 items-center rounded-full border border-border px-4 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent disabled:opacity-45"
              >
                Edit
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  onToggleStatus?.(
                    category._id,
                    category.status === 'active' ? 'draft' : 'active',
                  )
                }
                className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:opacity-45"
              >
                {category.status === 'active' ? 'Move to draft' : 'Activate'}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete?.(category._id)}
                className="inline-flex min-h-9 items-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
