import Container from './Container';
import FallbackImage from './FallbackImage';
import { getContent } from '../../data/content';

// The one banner used by the About, FAQ and Contact pages. A page only says
// which block of src/data/siteContent.json to read, and every block has the
// same four fields: eyebrow, title, description and image (+ imageFallback,
// used when the photo file is missing).
//
// The photo band sits on top and shows as it is (no colour wash over it); the
// heading block below carries the text: eyebrow in the accent highlight,
// title in black and the description in a softened black.
export default function PageBanner({ contentKey, className = '' }) {
  const banner = getContent(contentKey, {});

  return (
    <section
      className={[
        'relative w-full overflow-hidden border-b border-border bg-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="relative h-48 w-full sm:h-64 lg:h-80">
        <FallbackImage
          src={banner.image}
          fallbackSrc={banner.imageFallback}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>

      <Container className="py-10 sm:py-12 lg:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
          {banner.eyebrow}
        </p>

        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-tight text-black sm:text-4xl lg:text-[46px]">
          {banner.title}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/70 sm:text-base sm:leading-8">
          {banner.description}
        </p>
      </Container>
    </section>
  );
}
