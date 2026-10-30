import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Store, UserRound } from 'lucide-react';

import ReviewMediaGrid from './ReviewMediaGrid';
import VendorReviewForm from './VendorReviewForm';
import StatusPill from '../dashboard/StatusPill';
import StarRating from '../common/StarRating';
import { fetchVendorReviews } from '../../slices/vendorReviewSlice';
import { formatDate } from '../../utils/format';
import { reviewerName } from '../../utils/reviews';

// Reviews for the seller behind a product. Approving a vendor review is what makes
// it public, so only approved rows are returned by the API.
export default function VendorReviewSection({ vendorId }) {
  const dispatch = useDispatch();
  const vendorReviews = useSelector((state) => state.vendorReviews);

  useEffect(() => {
    if (vendorId) dispatch(fetchVendorReviews(vendorId));
  }, [dispatch, vendorId]);

  const items = useMemo(
    () => (vendorReviews.itemsVendorId === vendorId ? vendorReviews.items : []),
    [vendorReviews.itemsVendorId, vendorReviews.items, vendorId],
  );

  if (!vendorId) return null;

  const isPending = vendorReviews.loading || vendorReviews.itemsVendorId !== vendorId;

  return (
    <section id="store-reviews" className="mt-16 border-t border-border pt-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">The seller</p>
      <h2 className="mt-3 flex items-center gap-2 font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
        <Store size={22} strokeWidth={1.7} aria-hidden="true" />
        Store reviews
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {isPending ? (
            <div className="flex flex-col gap-3" aria-busy="true">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-3xl border border-border bg-white/60" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border bg-white px-5 py-8 text-center text-sm text-muted">
              No store reviews yet.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white">
              {items.map((review) => {
                const reviewer = review.userId ?? {};

                return (
                  <li key={review._id} className="p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-peach/30 text-accent">
                        {reviewer.profilePicture ? (
                          <img src={reviewer.profilePicture} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserRound size={16} strokeWidth={1.7} aria-hidden="true" />
                        )}
                      </span>

                      <StarRating value={review.rating} size={14} />

                      <span className="text-sm font-medium text-primary">
                        {reviewerName(review)}
                      </span>
                      <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>

                      {review.verifiedPurchase && (
                        <StatusPill value="verified" label="verified buyer" tone="success" />
                      )}
                    </div>

                    {review.title && <p className="mt-3 text-sm font-medium text-primary">{review.title}</p>}
                    {review.comment && <p className="mt-1 text-sm leading-6 text-muted">{review.comment}</p>}

                    <ReviewMediaGrid media={review.media} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <VendorReviewForm vendorId={vendorId} />
        </div>
      </div>
    </section>
  );
}
