import StatusPill from '../dashboard/StatusPill';
import ReviewItem from '../review/ReviewItem';

// Reviews for this vendor's products. They come from the public product review
// endpoint, so only approved reviews are returned and there is no reply action
// (the API has no vendor response endpoint).
export default function VendorReviewList({
  groups = [],
  loading = false,
  error = null,
  emptyMessage = 'No approved reviews on your products yet.',
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-white/60" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  const withReviews = groups.filter((group) => group.reviews.length > 0);

  if (withReviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {withReviews.map((group) => (
        <section key={group.productId} className="rounded-2xl border border-border bg-white p-5 sm:p-6">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-primary">{group.productName}</h3>
              <p className="mt-0.5 text-xs text-muted">
                {group.reviews.length} approved {group.reviews.length === 1 ? 'review' : 'reviews'}
                {group.ratingAverage
                  ? ` · average ${Number(group.ratingAverage).toFixed(1)} ★`
                  : ''}
              </p>
            </div>

            {group.status && <StatusPill value={group.status} />}
          </header>

          <ul className="divide-y divide-border">
            {group.reviews.map((review) => (
              <li key={review._id}>
                <ReviewItem review={review} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
