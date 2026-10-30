import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Shared heading block for the homepage sections.
//
// From the small breakpoint up the title sits on the left and the action on the
// right, joined by the underlined accent link the section references use. On a
// phone the action becomes a compact pill under the copy: the underlined link
// left a small, faint line stranded at the bottom of the block, and the pill
// reads as the one thing to tap without taking the whole width.
export default function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center';

  return (
    <div
      className={[
        'flex flex-col gap-4',
        isCentered
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end sm:justify-between sm:gap-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px] sm:tracking-[0.32em]">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2.5 font-serif text-3xl font-medium leading-[1.08] tracking-tight text-primary sm:mt-3 sm:text-4xl lg:text-[42px]">
          {title}
        </h2>

        {description && (
          <p className="mt-2.5 text-[13px] leading-6 text-muted sm:mt-3 sm:text-base sm:leading-7">
            {description}
          </p>
        )}
      </div>

      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="group inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-primary/25 px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:border-primary/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:min-h-0 sm:rounded-none sm:border-0 sm:p-0 sm:text-[15px] sm:font-medium sm:normal-case sm:tracking-normal sm:text-accent sm:underline sm:decoration-accent/60 sm:decoration-1 sm:underline-offset-[6px] sm:hover:text-primary"
        >
          {actionLabel}
          <ArrowRight
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
