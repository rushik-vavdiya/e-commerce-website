import { Link } from 'react-router-dom';
import { Compass, Home, SearchX } from 'lucide-react';

import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { getContent } from '../../data/content';

// Wording lives in src/data/siteContent.json under "notFound".
const copy = getContent('notFound', {});

// Real 404 page. Before this existed the catch-all route silently redirected to
// the homepage, so a mistyped or dead link looked like the site had ignored the
// click. Keeping the storefront header and footer means the visitor can carry on
// browsing from here.
export default function NotFound() {
  return (
    <StorefrontLayout>
      <section className="w-full bg-background">
        <div className="mx-auto flex w-full max-w-[1900px] flex-col items-center px-5 py-20 text-center sm:px-8 lg:py-28">
          <span className="flex size-14 items-center justify-center rounded-full border border-border bg-white text-accent">
            <SearchX size={24} strokeWidth={1.6} aria-hidden="true" />
          </span>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {copy.eyebrow}
          </p>

          <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl">
            {copy.title}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            {copy.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
            >
              <Home size={16} strokeWidth={1.8} aria-hidden="true" />
              {copy.homeLabel}
            </Link>

            <Link
              to="/shop"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-6 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
            >
              <Compass size={16} strokeWidth={1.8} aria-hidden="true" />
              {copy.shopLabel}
            </Link>
          </div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
