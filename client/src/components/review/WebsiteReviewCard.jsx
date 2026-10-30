import { UserRound } from 'lucide-react';

import StarRating from '../common/StarRating';
import { formatMonth } from '../../utils/format';
import { reviewQuote, reviewerName } from '../../utils/reviews';

// One approved website review as a card: photo in a slim ring, the reviewer and
// stars, the quote, then the month. Used as the slide content of the homepage
// review slider.
export default function WebsiteReviewCard({ review }) {
  const reviewer = review.userId ?? {};
  const quote = reviewQuote(review);
  const month = formatMonth(review.createdAt);

  return (
    <article className="flex h-full w-full flex-col gap-4 rounded-2xl border border-border bg-white p-5 transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(122,46,31,0.1)] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-peach/40 text-primary">
          {reviewer.profilePicture ? (
            <img
              src={reviewer.profilePicture}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={18} strokeWidth={1.7} aria-hidden="true" />
          )}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary">{reviewerName(review)}</p>
          <StarRating value={review.rating} size={13} className="mt-1" />
        </div>
      </div>

      {quote && (
        <blockquote
          title={quote}
          className="font-serif text-[15px] italic leading-7 text-muted"
        >
          “{quote}”
        </blockquote>
      )}

      {month && (
        <p className="mt-auto text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          {month}
        </p>
      )}
    </article>
  );
}
