import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star } from 'lucide-react';

import Button from '../common/Button';
import { addVendorReview, addVendorReviewMedia, clearVendorReviewError } from '../../slices/vendorReviewSlice';

const ACCEPTED_MEDIA = 'image/*,video/mp4,video/webm,video/quicktime';
const MAX_MEDIA = 6;

// Writes a review for a vendor store. A reviewer can attach several images and/or
// short videos, which are uploaded right after the review is created.
export default function VendorReviewForm({ vendorId }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const signedIn = useSelector((state) => Boolean(state.auth.token));
  const { loading, error } = useSelector((state) => state.vendorReviews);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [inputKey, setInputKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);

  if (!vendorId) return null;

  if (!signedIn) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white p-5">
        <h3 className="text-sm font-medium text-primary">Review this store</h3>
        <p className="mt-1 text-xs leading-5 text-muted">
          Sign in to share your experience with this seller.
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
    dispatch(clearVendorReviewError());
    setNotice(null);

    const nextErrors = {};
    if (!rating) nextErrors.rating = 'Choose a rating from 1 to 5 stars.';
    if (comment.trim().length > 2000) nextErrors.comment = 'Keep the review under 2000 characters.';

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const created = await dispatch(
        addVendorReview({
          vendorId,
          rating,
          ...(title.trim() ? { title: title.trim() } : {}),
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        }),
      ).unwrap();

      let mediaNote = '';
      if (mediaFiles.length > 0) {
        try {
          await dispatch(addVendorReviewMedia({ reviewId: created.data._id, files: mediaFiles })).unwrap();
        } catch (message) {
          mediaNote = ` The review was saved, but the media upload failed: ${String(message)}`;
        }
      }

      setRating(0);
      setTitle('');
      setComment('');
      setMediaFiles([]);
      setInputKey((key) => key + 1);
      setNotice({ tone: 'success', text: `Thanks! Your store review is waiting for moderation.${mediaNote}` });
    } catch {
      // The failure message comes from the slice below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-border bg-white p-5">
      <h3 className="text-sm font-medium text-primary">Review this store</h3>

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
          <label htmlFor="vendor-review-title" className="text-xs font-medium text-primary">
            Title (optional)
          </label>
          <input
            id="vendor-review-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Reliable seller"
            className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent"
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="vendor-review-comment" className="text-xs font-medium text-primary">
            Your review
          </label>
          <textarea
            id="vendor-review-comment"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="How was the packaging, delivery and product quality?"
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
          />
          {fieldErrors.comment && <p className="text-xs text-red-600">{fieldErrors.comment}</p>}
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="vendor-review-media" className="text-xs font-medium text-primary">
            Photos / videos (optional, up to {MAX_MEDIA})
          </label>
          <input
            key={inputKey}
            id="vendor-review-media"
            type="file"
            multiple
            accept={ACCEPTED_MEDIA}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > MAX_MEDIA) {
                setFieldErrors((current) => ({ ...current, media: `Choose at most ${MAX_MEDIA} files.` }));
                return;
              }
              setFieldErrors((current) => ({ ...current, media: undefined }));
              setMediaFiles(files);
            }}
            className="w-full text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:text-primary"
          />
          {mediaFiles.length > 0 && <p className="text-[11px] text-muted">{mediaFiles.length} file(s) selected</p>}
          {fieldErrors.media && <p className="text-xs text-red-600">{fieldErrors.media}</p>}
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
          Submit store review
        </Button>
      </div>
    </form>
  );
}
