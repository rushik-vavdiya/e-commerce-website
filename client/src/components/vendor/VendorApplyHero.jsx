import { Link } from 'react-router-dom';
import { ArrowRight, Check, LayoutDashboard } from 'lucide-react';

import FallbackImage from '../common/FallbackImage';

// Banner for /vendor/apply. Same pattern as the other storefront banners: the
// image is a placeholder path with a real file as the fallback, and a primary
// gradient keeps the white copy readable over any photograph.
const FACTS = ['Free to apply', 'Reviewed by an admin', 'Your own store page'];

export default function VendorApplyHero() {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-border">
      <FallbackImage
        src="/images/placeholder-banner.svg"
        fallbackSrc="/images/placeholder-banner.svg"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center motion-safe:animate-hero-image"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/45" />

      <div className="mx-auto w-full max-w-[1900px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <nav aria-label="Breadcrumb" className="text-xs text-white/70">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="transition-colors hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <span aria-current="page" className="font-medium text-white">
                Become a vendor
              </span>
            </li>
          </ol>
        </nav>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.32em] text-peach">
          Sell with Lunella
        </p>

        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[56px]">
          Put your store in front of people who already shop here
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
          Apply with a customer account. An admin reads the application and decides —
          once it is approved, your account becomes a vendor account with its own
          store page and dashboard. Nothing is approved automatically.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#vendor-apply"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-primary transition-colors hover:bg-peach"
          >
            Start your application
            <ArrowRight size={16} strokeWidth={1.9} aria-hidden="true" />
          </a>

          <Link
            to="/vendor-preview"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/45 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
          >
            <LayoutDashboard size={16} strokeWidth={1.8} aria-hidden="true" />
            Preview the dashboard
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-2 text-xs text-white/85">
              <Check size={14} strokeWidth={2.2} aria-hidden="true" className="text-peach" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
