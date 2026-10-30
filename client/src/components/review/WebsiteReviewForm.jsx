import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star } from 'lucide-react';

import Button from '../common/Button';
import { addWebsiteReview, clearWebsiteReviewError } from '../../slices/websiteReviewSlice';

// Reviews of the website itself. Text only — there is no media input here.
export default function WebsiteReviewForm() {
  const dispatch = useDispatch();
  const location = useLocation();
  const signedIn = useSelector((state) => Boolean(state.auth.token));
  const { loading, error } = useSelector((state) => state.websiteReviews);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);

  if (!signedIn) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white p-5">
        <h3 className="text-sm font-medium text-primary">Review our website</h3>
        <p className="mt-1 text-xs leading-5 text-muted">
          Tell us how the browsing and checkout experience felt. Sign in first —
          your review shows your name and photo.
        </p>
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="mt-4 inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Sign in to review
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearWebsiteReviewError());
    setNotice(null);

    const nextErrors = {};
    if (!rating) nextErrors.rating = 'Choose a rating from 1 to 5 stars.';
    if (comment.trim().length === 0) nextErrors.comment = 'Please write a short review.';
    if (comment.trim().length > 2000) nextErrors.comment = 'Keep the review under 2000 characters.';

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await dispatch(
        addWebsiteReview({
          rating,
          ...(title.trim() ? { title: title.trim() } : {}),
          comment: comment.trim(),
        }),
      ).unwrap();

      setRating(0);
      setTitle('');
      setComment('');
      setNotice({ tone: 'success', text: 'Thanks! Your website review is waiting for moderation.' });
    } catch {
      // The failure message comes from the slice below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-border bg-white p-5">
      <h3 className="text-sm font-medium text-primary">Review our website</h3>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-primary">
            Your rating <span className="text-accent">*</span>
          </p>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? '' : 's'}`}
                aria-pressed={rating === value}
                className="rounded-lg p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className={value <= rating ? 'fill-accent text-accent' : 'text-border'}
                />
              </button>
            ))}
          </div>
          {fieldErrors.rating && <p className="mt-1 text-xs text-red-600">{fieldErrors.rating}</p>}
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="website-review-title" className="text-xs font-medium text-primary">
            Title (optional)
          </label>
          <input
            id="website-review-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Great shopping experience"
            className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="website-review-comment" className="text-xs font-medium text-primary">
            Your review <span className="text-accent">*</span>
          </label>
          <textarea
            id="website-review-comment"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What worked well and what could be better?"
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
          {fieldErrors.comment && <p className="text-xs text-red-600">{fieldErrors.comment}</p>}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="mt-4 rounded-2xl border border-peach bg-peach/30 px-4 py-3 text-xs text-primary">
          {notice.text}
        </p>
      )}

      <div className="mt-5">
        <Button type="submit" variant="primary" loading={loading}>
          Submit website review
        </Button>
      </div>
    </form>
  );
}
