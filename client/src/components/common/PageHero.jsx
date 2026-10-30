import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import FallbackImage from './FallbackImage';

// Simple page heading band shared by the FAQ, Category, Product and Contact
// pages. `breadcrumb` is an array of { label, href } — the last entry is the
// current page. `image`/`imageFallback` turns it into a photo band: the photo
// sits on top, shown as it is, and the heading block below it is the five text
// pieces (breadcrumb crumbs, eyebrow, title, description and action children)
// with the eyebrow in the accent highlight and everything else in black.
export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  image,
  imageFallback,
  children,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center';
  const hasImage = Boolean(image);

  return (
    <section
      className={[
        'relative w-full overflow-hidden border-b border-border bg-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hasImage && (
        <div className="relative h-48 w-full sm:h-64 lg:h-80">
          <FallbackImage
            src={image}
            fallbackSrc={imageFallback}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-[1900px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className={isCentered ? 'mx-auto max-w-3xl text-center' : ''}>
          {breadcrumb.length > 0 && (
            <nav aria-label="Breadcrumb" className="text-xs text-muted">
              <ol
                className={`flex flex-wrap items-center gap-1.5 ${
                  isCentered ? 'justify-center' : ''
                }`}
              >
                {breadcrumb.map((crumb, index) => (
                  <li
                    key={crumb.href ?? crumb.label}
                    className="flex items-center gap-1.5"
                  >
                    {index > 0 && <ChevronRight size={12} aria-hidden="true" />}

                    {crumb.href ? (
                      <Link
                        to={crumb.href}
                        className="transition-colors hover:text-accent"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="font-medium text-black">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {eyebrow && (
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.32em] text-accent ${
                breadcrumb.length > 0 ? 'mt-5' : ''
              }`}
            >
              {eyebrow}
            </p>
          )}

          <h1
            className={`font-serif text-3xl font-medium leading-tight tracking-tight text-black sm:text-4xl lg:text-[44px] ${
              eyebrow ? 'mt-3' : breadcrumb.length > 0 ? 'mt-5' : ''
            }`}
          >
            {title}
          </h1>

          {description && (
            <p
              className={`max-w-2xl text-sm leading-7 text-black/70 sm:text-base ${
                isCentered ? 'mx-auto' : ''
              } mt-4`}
            >
              {description}
            </p>
          )}

          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
