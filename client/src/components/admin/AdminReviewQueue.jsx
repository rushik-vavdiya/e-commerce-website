import ReviewMediaGrid from '../review/ReviewMediaGrid';
import StatusPill from '../dashboard/StatusPill';
import StarRating from '../common/StarRating';
import { formatDate } from '../../utils/format';
import { reviewerName } from '../../utils/reviews';

// Review moderation queue backed by GET /reviews/admin/pending and
// PATCH /reviews/admin/:reviewId. Approving is what makes a review visible on
// the storefront, so nothing is shown as approved before that call succeeds.
export default function AdminReviewQueue({
  reviews = [],
  loading = false,
  error = null,
  onModerate,
  busyId = null,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl border border-border bg-white/60" />
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

  if (reviews.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
        Nothing waiting for moderation. Customer reviews are submitted as pending
        and can only come from a delivered order.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((review) => {
        const busy = busyId === review._id;
        const reviewer = reviewerName(review);

        return (
          <li key={review._id} className="rounded-3xl border border-border bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-primary">
                  <StarRating value={review.rating} size={14} />
                  {review.title || 'Untitled review'}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <StatusPill value={review.status} />
                  {review.verifiedPurchase && (
                    <StatusPill value="verified" label="verified purchase" tone="success" />
                  )}
                  <span>{reviewer}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onModerate?.(review._id, 'approved')}
                    className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:opacity-45"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onModerate?.(review._id, 'rejected')}
                    className="inline-flex min-h-9 items-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>

            {review.comment && (
              <p className="mt-4 text-sm leading-6 text-muted">{review.comment}</p>
            )}

            <ReviewMediaGrid media={review.media} />

            <p className="mt-4 text-[11px] text-muted">
              Product id: {String(review.productId ?? '—')}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
