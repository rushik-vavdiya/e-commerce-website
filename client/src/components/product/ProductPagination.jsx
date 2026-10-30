import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { pageWindow } from '../../utils/pagination';

// Paging under a list: the current page with its neighbours, plus the first and
// last, so a long list reads « 1 … 4 5 6 … 12 » rather than a wall of numbers.
//
// Two ways to move, chosen by props:
//   hrefForPage  — pages are links (the storefront passes one), which keeps a
//                  filtered URL shareable.
//   onPageChange — pages are buttons (the admin modules pass one), because
//                  their list is state, not a URL.
// The arrows are the same control with a disabled look at either end, so the
// row never shifts when one of them is unavailable.
const CIRCLE =
  'flex size-9 shrink-0 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

const IDLE = `${CIRCLE} cursor-not-allowed text-muted opacity-45`;
const LIVE = `${CIRCLE} text-primary hover:bg-peach/50`;

export default function ProductPagination({
  page = 1,
  pages = 1,
  total = 0,
  limit = 0,
  hrefForPage,
  onPageChange,
  label = 'Product pages',
  className = '',
}) {
  if (pages <= 1) return null;

  const first = (page - 1) * limit + 1;
  const last = limit ? Math.min(page * limit, total || page * limit) : total;
  const rows = pageWindow(page, pages);

  // One end of the row: a disabled marker at either extreme, otherwise a
  // button (admin) or a link (storefront).
  const endControl = (target, { ariaLabel, rel, content }) => {
    if (target === null) {
      return (
        <span aria-hidden="true" className={IDLE}>
          {content}
        </span>
      );
    }

    if (onPageChange) {
      return (
        <button
          type="button"
          onClick={() => onPageChange(target)}
          aria-label={ariaLabel}
          className={LIVE}
        >
          {content}
        </button>
      );
    }

    return (
      <Link to={hrefForPage(target)} aria-label={ariaLabel} rel={rel} className={LIVE}>
        {content}
      </Link>
    );
  };

  return (
    <nav
      aria-label={label}
      className={['flex flex-col items-center gap-4 sm:flex-row sm:justify-between', className]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-xs text-muted sm:text-sm" aria-live="polite">
        {total > 0 && limit > 0
          ? `Showing ${first}–${last} of ${total}`
          : `Page ${page} of ${pages}`}
      </p>

      <div className="flex items-center gap-1.5 rounded-full border border-border bg-white p-1.5 shadow-[0_14px_36px_-24px_rgba(122,46,31,0.55)]">
        {endControl(page > 1 ? page - 1 : null, {
          ariaLabel: 'Previous page',
          rel: 'prev',
          content: <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />,
        })}

        {rows.map((row, index) =>
          row === 'gap' ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-sm text-muted"
            >
              …
            </span>
          ) : row === page ? (
            onPageChange ? (
              <button
                key={row}
                type="button"
                aria-label={`Page ${row}`}
                aria-current="page"
                onClick={() => onPageChange(row)}
                className={`${CIRCLE} bg-primary font-semibold text-white shadow-[0_10px_20px_-10px_rgba(122,46,31,0.9)]`}
              >
                {row}
              </button>
            ) : (
              <Link
                key={row}
                to={hrefForPage(row)}
                aria-label={`Page ${row}`}
                aria-current="page"
                className={`${CIRCLE} bg-primary font-semibold text-white shadow-[0_10px_20px_-10px_rgba(122,46,31,0.9)]`}
              >
                {row}
              </Link>
            )
          ) : onPageChange ? (
            <button
              key={row}
              type="button"
              aria-label={`Page ${row}`}
              onClick={() => onPageChange(row)}
              className={`${CIRCLE} text-primary hover:bg-peach/50`}
            >
              {row}
            </button>
          ) : (
            <Link
              key={row}
              to={hrefForPage(row)}
              aria-label={`Page ${row}`}
              className={`${CIRCLE} text-primary hover:bg-peach/50`}
            >
              {row}
            </Link>
          ),
        )}

        {endControl(page < pages ? page + 1 : null, {
          ariaLabel: 'Next page',
          rel: 'next',
          content: <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />,
        })}
      </div>
    </nav>
  );
}