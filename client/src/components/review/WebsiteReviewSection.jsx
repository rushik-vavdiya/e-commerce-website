import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import WebsiteReviewCard from './WebsiteReviewCard';
import { getContent } from '../../data/content';

import 'swiper/css';
import 'swiper/css/pagination';

// The eyebrow, heading and the sentence under it come from the "reviews" home
// section, with src/data/siteContent.json (key "home.reviews") as the fallback.
const fallbackCopy = getContent('home.reviews', {});

// Visitors who ask the OS for less motion get a still carousel they can drag;
// everyone else sees it advance on its own, one review at a time.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const AUTOPLAY = prefersReducedMotion
  ? false
  : {
      delay: 3200,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      waitForTransition: true,
    };

// Public website reviews: the eyebrow, heading and subtitle, with the approved
// reviews sliding underneath — one card at a time, on a loop. This band is
// read-only; customers write a review from their account area instead
// (/account/review), which keeps the form off the storefront.
export default function WebsiteReviewSection() {
  const copy = fallbackCopy;

  const websiteReviews = useSelector((state) => state.websiteReviews);

  const { items, loading, error } = websiteReviews;
  const isEmpty = !loading && items.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
          {copy.eyebrow}
        </p>

        <h2
          id="store-reviews-heading"
          className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl lg:text-[42px]"
        >
          {copy.heading}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
          {copy.description}
        </p>
      </div>

      {loading && items.length === 0 && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((card) => (
            <li
              key={card}
              className="h-40 animate-pulse rounded-2xl border border-border bg-white/70"
            />
          ))}
        </ul>
      )}

      {error && items.length === 0 && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {isEmpty && !error && (
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <p className="font-serif text-lg text-primary">{copy.emptyTitle}</p>
          <p className="mt-2 text-sm text-muted">{copy.emptyText}</p>
        </div>
      )}

      {items.length > 0 && (
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          slidesPerGroup={1}
          spaceBetween={20}
          speed={650}
          loop={items.length > 3}
          autoplay={AUTOPLAY}
          pagination={{ clickable: true }}
          a11y={{ enabled: true, containerRoleDescriptionMessage: 'Reviews carousel' }}
          className="store-reviews-swiper w-full pb-10"
          breakpoints={{
            640: { slidesPerView: 2, slidesPerGroup: 1 },
            1024: { slidesPerView: 3, slidesPerGroup: 1 },
          }}
        >
          {items.map((review) => (
            <SwiperSlide key={review._id} className="flex">
              <WebsiteReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
