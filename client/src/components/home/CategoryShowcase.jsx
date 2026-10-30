import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';

import FallbackImage from '../common/FallbackImage';
import RowArrows from './RowArrows';
import { useContent } from '../../hooks/useSiteContent';

import 'swiper/css';


const MAX_CIRCLES = 8;

// Circle sizes stay in one place so the skeletons and the real tiles can never
// drift apart. A phone shows the departments as a two-column grid (nothing
// clipped, every name readable); from the small breakpoint up the slider takes
// over, where a partial circle is a visible hint that the row keeps going.
const SLIDE_LAYOUT = {
  base: { slidesPerView: 3.6, spaceBetween: 22 },
  breakpoints: {
    640: { slidesPerView: 3.6, spaceBetween: 22 },
    // Three up until the row is wide enough for four 160px circles; four
    // squeezed in earlier would push the outer circles onto the hanging
    // garments in the backdrop.
    1024: { slidesPerView: 3, spaceBetween: 26 },
    1280: { slidesPerView: 4, spaceBetween: 26 },
  },
};

// The uploaded category photo is usually a full-length product shot: cropping it
// into a circle cut the model in half, so the circle is filled with a soft, out
// of focus copy of the same photo and the whole picture sits on top of it. The
// circle is never empty and the model is never cut.
const CIRCLE_CLASS =
  'block aspect-square w-full max-w-[144px] rounded-full bg-gradient-to-br from-[#F8E9DE] to-[#F0D9C8] p-[3px] ring-1 ring-accent/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-accent/50 group-hover:shadow-[0_16px_32px_-16px_rgba(122,46,31,0.55)] group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-background lg:max-w-[160px]';

// One department: the circular photo and the name under it. Shared by the phone
// grid and the slider, so the two can never drift apart.
function CategoryTile({ category, imageFallback }) {
  const cover = category.image || imageFallback;

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className="group mx-auto flex w-full flex-col items-center text-center focus-visible:outline-none"
    >
      <span className={CIRCLE_CLASS}>
        <span className="relative block h-full w-full overflow-hidden rounded-full bg-peach/60">
          {category.image && (
            <span
              aria-hidden="true"
              className="absolute inset-0 scale-125 bg-cover bg-center opacity-55 blur-[6px]"
              style={{ backgroundImage: `url("${category.image}")` }}
            />
          )}

          <FallbackImage
            src={cover}
            fallbackSrc={imageFallback}
            alt=""
            loading="lazy"
            className="relative h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </span>
      </span>

      <span className="mt-3 line-clamp-2 text-[12px] font-medium leading-5 tracking-tight text-primary transition-colors duration-200 group-hover:text-accent sm:mt-3.5 sm:text-sm">
        {category.name}
      </span>
    </Link>
  );
}

// The section is a full-bleed room scene (arched niches with hanging kurtis on
// either side), so the photograph runs edge to edge behind the content instead
// of sitting inside the page container. Only the heading and the circles are
// held to a column width, which keeps the empty wall in the middle of the image
// exactly where the copy lands.
//
// "Shop by category": one circle per top-level department, with its name
// underneath. The departments come from the categories slice, which loads them
// from the real backend API. One slider serves every screen — a handful of
// departments sit centred, more than fit are dragged or swiped through.
export default function CategoryShowcase() {
  // The photo on each circle is the department's own image from the database
  // (Category.image), uploaded in admin -> Categories; this is only the
  // placeholder for a department without one.
  const imageFallback = useContent('home.categories.imageFallback', '');
  // Which departments to show, and in what order. Anything not named here still
  // shows, after the ones that are, so a new department is never hidden.
  const order = useContent('home.categories.order', []);
  // Optional intro above the circles; it does not render when the copy is absent.
  const heading = useContent('home.categories.heading', {});
  const { items = [], loading } = useSelector((state) => state.categories);

  const categories = items
    .filter((category) => category.status === 'active')
    .sort((first, second) => {
      const firstAt = order.indexOf(first.slug);
      const secondAt = order.indexOf(second.slug);

      return (firstAt === -1 ? order.length : firstAt) - (secondAt === -1 ? order.length : secondAt);
    })
    .slice(0, MAX_CIRCLES);

  const showSkeleton = loading && categories.length === 0;

  // The slider above the phone breakpoint gets the same prev/next pair as the
  // product rows: the pair is disabled at whichever end the row is resting on,
  // and hidden entirely while every department already fits.
  const swiperRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const syncEdges = (swiper) => {
    if (!swiper) return;

    setEdges((current) =>
      current.start === swiper.isBeginning && current.end === swiper.isEnd
        ? current
        : { start: swiper.isBeginning, end: swiper.isEnd },
    );
  };

  if (!showSkeleton && categories.length === 0) return null;

  return (
    <section className="relative isolate flex w-full overflow-hidden bg-[#F7EBDA] lg:aspect-[1946/808] lg:min-h-[440px]">
      {/* Full-bleed backdrop: the room scene, never cropped by the page
          container. Two files of the same room, swapped by viewport width — the
          wide shot (1946×808) from md up, where the band is landscape enough to
          show both hanging rails at its edges (and from lg the aspect ratio
          below matches the file exactly, so nothing is cropped at all); below
          md the section is a tall, portrait-shaped stack where a wide file would
          slice both rails off and leave bare wall, so it gets the portrait cut
          (941×1672), whose ratio tracks a handheld screen and keeps the arches,
          garments and brass pots in frame. object-cover keeps the scene anchored
          to the edges at any width. */}
      <picture>
        <source media="(min-width: 768px)" srcSet="/images/category.png" />
        <img
          src="/images/category-mobile.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
      </picture>

      {/* A whisper of cream behind the copy so the small text stays legible on
          the plaster wall without washing the photograph out. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(253,245,234,0.55)_0%,rgba(253,245,234,0.15)_45%,rgba(253,245,234,0)_70%)]"
      />

      <div className="relative mx-auto flex w-full max-w-[1900px] flex-col justify-center px-5 py-14 text-center sm:px-8 lg:px-10 lg:py-12">
        {(heading.title || heading.eyebrow) && (
          <div className="mb-8 text-center sm:mb-12">
            {heading.eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
                {heading.eyebrow}
              </p>
            )}

            {heading.title && (
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
                {heading.title}
              </h2>
            )}

            {heading.description && (
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
                {heading.description}
              </p>
            )}
          </div>
        )}

        {showSkeleton ? (
          <ul
            className="mx-auto flex w-full max-w-[820px] justify-center gap-3.5 sm:gap-5 lg:max-w-[58vw]"
            aria-busy="true"
          >
            {[0, 1, 2].map((card) => (
              <li key={card} className="flex max-w-[160px] flex-1 flex-col items-center">
                <span className="block aspect-square w-full animate-pulse rounded-full bg-peach/40 p-[3px]">
                  <span className="block h-full w-full rounded-full bg-peach/60" />
                </span>
                <span className="mt-3 h-3 w-16 animate-pulse rounded-full bg-peach/60 sm:mt-3.5" />
              </li>
            ))}
          </ul>
        ) : (
          <>
            {/* Phones: two columns, so every circle and every name is whole. */}
            <ul className="mx-auto grid w-full max-w-[440px] grid-cols-2 gap-x-6 gap-y-7 sm:hidden">
              {categories.map((category) => (
                <li key={category._id ?? category.slug}>
                  <CategoryTile category={category} imageFallback={imageFallback} />
                </li>
              ))}
            </ul>

            {/* From the small breakpoint up: the slider, with a partial circle as
                the hint that more departments are a swipe away. The wrapper hides
                it on phones (Swiper's own display rule would win on the root). */}
            {!(edges.start && edges.end) && (
              <div className="mx-auto mb-5 hidden w-full max-w-[820px] sm:flex lg:max-w-[58vw]">
                <RowArrows
                  label="categories"
                  className="ml-auto"
                  onPrev={() => swiperRef.current?.slidePrev()}
                  onNext={() => swiperRef.current?.slideNext()}
                  canPrev={!edges.start}
                  canNext={!edges.end}
                />
              </div>
            )}

            <div className="hidden sm:block">
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  syncEdges(swiper);
                }}
                onSlideChange={syncEdges}
                onResize={syncEdges}
                slidesPerView={SLIDE_LAYOUT.base.slidesPerView}
                spaceBetween={SLIDE_LAYOUT.base.spaceBetween}
                grabCursor
                watchOverflow
                a11y={{ enabled: true, containerRoleDescriptionMessage: 'Shop by category' }}
                className="category-swiper mx-auto w-full max-w-[820px] lg:max-w-[58vw]"
                breakpoints={SLIDE_LAYOUT.breakpoints}
              >
                {categories.map((category) => (
                  <SwiperSlide key={category._id ?? category.slug} className="!h-auto">
                    <CategoryTile category={category} imageFallback={imageFallback} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
