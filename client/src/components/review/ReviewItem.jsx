import StarRating from '../common/StarRating';
import StatusPill from '../dashboard/StatusPill';
import { formatDate } from '../../utils/format';
import { reviewerName } from '../../utils/reviews';

// One review row: stars, author, date, then the title and the text. The product
// review list passes the review photos/videos as `children`, so the same row
// works for vendor reviews too.
export default function ReviewItem({ review, children = null }) {
  return (
    <article className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StarRating value={review.rating} size={14} />

        <span className="text-sm font-medium text-primary">{reviewerName(review)}</span>

        <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>

        {review.verifiedPurchase && (
          <StatusPill value="verified" label="verified purchase" tone="success" />
        )}
      </div>

      {review.title && <p className="mt-3 text-sm font-medium text-primary">{review.title}</p>}

      {review.comment && (
        <p className="mt-1 text-sm leading-6 text-muted">{review.comment}</p>
      )}

      {children}
    </article>
  );
}
