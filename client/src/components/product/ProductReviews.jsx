import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquareQuote, PenLine } from 'lucide-react';

import ReviewForm from './ReviewForm';
import ReviewItem from '../review/ReviewItem';
import ReviewMediaGrid from '../review/ReviewMediaGrid';
import RatingSummary from '../common/RatingSummary';
import Button from '../common/Button';
import { fetchProductReviews } from '../../slices/reviewSlice';
import { fetchOrders } from '../../slices/orderSlice';
import { averageRating, ratingBreakdown } from '../../utils/reviews';

const PAGE_SIZE = 5;

// Review section for the product page. Data comes from the public endpoint
// GET /reviews/product/:productId, which returns only approved reviews (up to
// 100) — so the summary and the breakdown are computed from real rows, and the
// list reveals more in client-side steps because the API has no paging.
//
// Layout: one compact rating strip, then the reviews, then the write-a-review
// form. The form is mounted only when the customer can actually submit (a
// delivered order, no review yet) and they asked for it, so the page never shows
// a full disabled form to people who cannot use it.
export default function ProductReviews({ productId, product }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const reviews = useSelector((state) => state.reviews);
  const orders = useSelector((state) => state.orders);
  const token = useSelector((state) => state.auth.token);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!productId) return;

    dispatch(fetchProductReviews(productId));
  }, [dispatch, productId]);

  // Eligibility is checked against the customer's own orders: the API only accepts
  // a review when a delivered order contains the product.
  useEffect(() => {
    if (token) dispatch(fetchOrders());
  }, [dispatch, token]);

  const hasDeliveredOrder = useMemo(
    () =>
      orders.items.some(
        (order) =>
          order.orderStatus === 'delivered' &&
          (order.items ?? []).some((item) => String(item.productId) === String(productId)),
      ),
    [orders.items, productId],
  );

  const alreadyReviewed = useMemo(
    () => reviews.items.some((review) => String(review.productId) === String(productId)),
    [reviews.items, productId],
  );

  // The slice clears `items` when a new request starts and records which product
  // the rows belong to, so these are always this product's reviews.
  const items = useMemo(
    () => (reviews.itemsProductId === productId ? reviews.items : []),
    [reviews.itemsProductId, reviews.items, productId],
  );

  const isPending = Boolean(productId) && (reviews.loading || reviews.itemsProductId !== productId);
  const requestFailed = reviews.itemsProductId === productId && Boolean(reviews.error);

  const average = averageRating(items);
  const breakdown = useMemo(() => ratingBreakdown(items), [items]);

  const canReview = Boolean(token) && hasDeliveredOrder && !alreadyReviewed;
  const showForm = canReview && formOpen;

  const reason = alreadyReviewed
    ? 'You have already reviewed this product — one review per product and account.'
    : 'Reviews can only be written after a delivered order for this product.';

  // "12 approved reviews loaded (14 recorded on the product)" — only mentions the
  // product total when the two numbers actually differ.
  const countNote = `${items.length} approved ${
    items.length === 1 ? 'review' : 'reviews'
  } loaded${
    product?.reviewCount && product.reviewCount !== items.length
      ? ` (${product.reviewCount} recorded on the product)`
      : ''
  }`;

  return (
    <section id="reviews" className="mt-12 border-t border-border pt-10 sm:mt-14 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            Customer feedback
          </p>

          <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
            Reviews
          </h2>
        </div>

        {canReview && (
          <Button
            variant="outline"
            size="sm"
            aria-expanded={showForm}
            aria-controls="review-form"
            onClick={() => setFormOpen((open) => !open)}
          >
            <PenLine size={14} strokeWidth={1.8} aria-hidden="true" />
            {showForm ? 'Close form' : 'Write a review'}
          </Button>
        )}
      </div>

      <div className="mt-4">
        <RatingSummary
          average={average}
          total={items.length}
          breakdown={breakdown}
          note={countNote}
          loading={isPending}
        />
      </div>

      {requestFailed && (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          {reviews.error}
        </p>
      )}

      <div className="mt-4">
        {isPending ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            {[0, 1].map((row) => (
              <div
                key={row}
                className="h-16 animate-pulse rounded-2xl border border-border bg-white/60"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-white px-4 py-3.5">
            <MessageSquareQuote
              size={20}
              strokeWidth={1.6}
              aria-hidden="true"
              className="shrink-0 text-accent"
            />

            <p className="text-xs leading-5 text-muted">
              <span className="block text-sm font-medium text-primary">No reviews yet</span>
              Approved reviews appear here once the studio publishes them.
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white px-4 sm:px-5">
              {items.slice(0, visibleCount).map((review) => (
                <li key={review._id}>
                  <ReviewItem review={review}>
                    <ReviewMediaGrid media={review.media} />
                  </ReviewItem>
                </li>
              ))}
            </ul>

            {visibleCount < items.length && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Show {Math.min(PAGE_SIZE, items.length - visibleCount)} more
                </Button>

                <span className="text-[11px] text-muted">
                  {Math.min(visibleCount, items.length)} of {items.length} shown
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {showForm ? (
        <div id="review-form" className="mt-4">
          <ReviewForm
            productId={productId}
            signedIn={Boolean(token)}
            canReview={canReview}
            reason={reason}
          />
        </div>
      ) : (
        !canReview &&
        (token ? (
          <p className="mt-4 text-[11px] leading-5 text-muted">{reason}</p>
        ) : (
          <p className="mt-4 text-[11px] leading-5 text-muted">
            Reviews are tied to your account.{' '}
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="font-semibold text-accent transition-colors hover:text-primary"
            >
              Sign in to write one
            </Link>
            .
          </p>
        ))
      )}
    </section>
  );
}
