import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

import AuthBenefits from './AuthBenefits';
import { getContent } from '../../data/content';

// The wordmark under the form on phones comes from the site content too, so a
// brand rename never leaves the auth pages on the old name.
const brandName = getContent('brand.logoText');

// Shared shell for every auth page.
//
// Structure: two columns. The banner column (desktop only) is a cream panel that
// ends at a hairline border; the form column is a white panel with the form
// centred in its own narrow measure. On phones there is a single white column
// with the wordmark above the form.
//
// Scrolling rules:
// - Desktop (lg+): the page is locked to the viewport, so only the form column
//   scrolls, and only when its content (Register) is taller than the screen.
// - Mobile: plain page flow, nothing is cut off.
export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-background lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen w-full lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)]">
        <AuthBenefits />

        <div className="flex min-h-0 flex-col bg-white lg:border-l lg:border-border">
          <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-5 py-10 sm:px-10 lg:px-14 lg:py-12">
            <div className="my-auto w-full max-w-[420px]">
              {/* The banner column carries the wordmark on desktop; on phones
                  this is the only place it appears. */}
              <Link
                to="/"
                className="mb-9 flex items-center justify-center gap-2.5 text-primary lg:hidden"
              >
                <Leaf size={20} strokeWidth={1.6} className="text-accent" aria-hidden="true" />
                <span className="text-lg font-medium tracking-[0.18em]">{brandName}</span>
              </Link>

              <header>
                {eyebrow && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                    {eyebrow}
                  </p>
                )}

                <h1 className="mt-3 font-serif text-[30px] font-medium leading-[1.12] tracking-tight text-primary sm:text-[34px]">
                  {title}
                </h1>

                {subtitle && (
                  <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
                )}
              </header>

              {/* A rule instead of a card: it separates the pitch from the form
                  without stacking a second panel inside the page. */}
              <div className="mt-7 border-t border-border pt-7">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
