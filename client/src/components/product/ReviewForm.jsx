import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../common/Button';
import StarRating from '../common/StarRating';
import { addReview, addReviewMedia, clearReviewError } from '../../slices/reviewSlice';

// Product reviews may carry pictures and short videos (max 6 files).
const ACCEPTED_MEDIA = 'image/*,video/mp4,video/webm,video/quicktime';
const MAX_MEDIA = 6;

// Review submission. The API accepts POST /reviews with { productId, rating,
// title?, comment? } and only for a customer with a delivered order for that
// product, so the form explains that instead of failing silently.
export default function ReviewForm({ productId, signedIn = false, canReview = false, reason = null }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.reviews);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  // Remounts the file input so the previous selection is cleared after submit.
  const [mediaInputKey, setMediaInputKey] = useState(0);

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-5 sm:p-6">
        <h3 className="text-sm font-medium text-primary">Write a review</h3>
        <p className="mt-1 text-xs leading-5 text-muted">
          Reviews are tied to your account, so please sign in first. You will come
          straight back to this product.
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
    dispatch(clearReviewError());
    setNotice(null);

    const nextErrors = {};

    if (!rating) nextErrors.rating = 'Choose a rating from 1 to 5 stars.';
    if (comment.trim().length > 2000) nextErrors.comment = 'Keep the review under 2000 characters.';
    if (title.trim().length > 120) nextErrors.title = 'Keep the title under 120 characters.';

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const created = await dispatch(
        addReview({
          productId,
          rating,
          ...(title.trim() ? { title: title.trim() } : {}),
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        }),
      ).unwrap();

      // The files are attached after the review exists, so the media call has an
      // id to upload to.
      let mediaNote = '';
      if (mediaFiles.length > 0) {
        try {
          await dispatch(
            addReviewMedia({ reviewId: created.data._id, files: mediaFiles }),
          ).unwrap();
        } catch (message) {
          mediaNote = ` The review was saved, but the media upload failed: ${String(message)}`;
        }
      }

      setRating(0);
      setTitle('');
      setComment('');
      setMediaFiles([]);
      setMediaInputKey((key) => key + 1);
      setNotice({
        tone: 'success',
        text: `Thanks! Your review was submitted and is waiting for moderation before it appears publicly.${mediaNote}`,
      });
    } catch {
      // The failure message is rendered from the reviews slice below.
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-white p-4 sm:p-5"
    >
      <h3 className="text-sm font-medium text-primary">Write a review</h3>

      {!canReview && reason && (
        <p className="mt-2 rounded-xl border border-dashed border-peach bg-peach/25 px-3 py-2 text-xs leading-5 text-muted">
          {reason}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-3">
        <fieldset disabled={!canReview || loading}>
          <legend className="text-xs font-medium text-primary">
            Your rating <span className="text-accent">*</span>
          </legend>

          <div className="mt-2 flex items-center gap-1">
            <StarRating
              value={rating}
              size={26}
              onChange={(value) => {
                setRating(value);
                setFieldErrors((current) => ({ ...current, rating: undefined }));
              }}
            />

            <span className="ml-2 text-xs text-muted">
              {rating ? `${rating} of 5` : 'Not rated yet'}
            </span>
          </div>

          {fieldErrors.rating && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.rating}</p>
          )}

          <div className="mt-3 flex w-full flex-col gap-1.5">
            <label htmlFor="review-title" className="text-xs font-medium text-primary">
              Title (optional)
            </label>

            <input
              id="review-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Sums up your experience"
              className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:bg-peach/20"
            />

            {fieldErrors.title && (
              <p className="text-xs text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          <div className="mt-3 flex w-full flex-col gap-1.5">
            <label htmlFor="review-comment" className="text-xs font-medium text-primary">
              Your review (optional)
            </label>

            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="How is the fit, the fabric and the finish?"
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:bg-peach/20"
            />

            {fieldErrors.comment && (
              <p className="text-xs text-red-600">{fieldErrors.comment}</p>
            )}
          </div>

          <div className="mt-3 flex w-full flex-col gap-1.5">
            <label htmlFor="review-media" className="text-xs font-medium text-primary">
              Photos / videos (optional, up to {MAX_MEDIA})
            </label>

            <input
              key={mediaInputKey}
              id="review-media"
              type="file"
              multiple
              accept={ACCEPTED_MEDIA}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length > MAX_MEDIA) {
                  setFieldErrors((current) => ({
                    ...current,
                    media: `Choose at most ${MAX_MEDIA} files.`,
                  }));
                  return;
                }
                setFieldErrors((current) => ({ ...current, media: undefined }));
                setMediaFiles(files);
              }}
              className="w-full text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:text-primary"
            />

            {mediaFiles.length > 0 && (
              <p className="text-[11px] text-muted">{mediaFiles.length} file(s) selected</p>
            )}

            {fieldErrors.media && (
              <p className="text-xs text-red-600">{fieldErrors.media}</p>
            )}
          </div>
        </fieldset>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      {notice?.tone === 'success' && (
        <p role="status" className="mt-4 rounded-2xl border border-peach bg-peach/30 px-4 py-3 text-xs text-primary">
          {notice.text}
        </p>
      )}

      <div className="mt-4">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading || !canReview}
        >
          Submit review
        </Button>
      </div>

      <p className="mt-2.5 text-[11px] leading-5 text-muted">
        One review per product per account. New reviews stay pending until an admin
        approves them.
      </p>
    </form>
  );
}
