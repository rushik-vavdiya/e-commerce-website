import { useState } from 'react';
import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5];

// Five stars. Read-only by default; pass `onChange` and the same component
// becomes the rating picker used by the review forms:
//
//   <StarRating value={4.5} />                                   read-only
//   <StarRating value={rating} onChange={setRating} size={26} />  picker
export default function StarRating({
  value = 0,
  onChange = null,
  size = 14,
  disabled = false,
  className = '',
}) {
  const rating = Number(value) || 0;
  const isPicker = typeof onChange === 'function';
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;

  if (!isPicker) {
    return (
      <span
        role="img"
        aria-label={`${rating} out of 5 stars`}
        className={`flex items-center gap-0.5 ${className}`}
      >
        {STARS.map((star) => (
          <Star
            key={star}
            size={size}
            strokeWidth={1.6}
            aria-hidden="true"
            className={star <= Math.round(rating) ? 'fill-star text-star' : 'text-border'}
          />
        ))}
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          aria-pressed={star === rating}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="rounded-lg p-1 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <Star
            size={size}
            strokeWidth={1.6}
            aria-hidden="true"
            className={star <= active ? 'fill-star text-star' : 'text-border'}
          />
        </button>
      ))}
    </span>
  );
}
