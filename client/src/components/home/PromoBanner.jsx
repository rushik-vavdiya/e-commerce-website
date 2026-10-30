import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import FallbackImage from '../common/FallbackImage';
import { useContentList } from '../../hooks/useSiteContent';

// Two promotional panels, exactly as in the design: a soft rose one and an olive
// one. Each photo is the card's full background — it runs edge to edge behind the
// copy too, and only a tonal veil lifts the text.
//
// The card copy comes from the content slice (key "home.promo.items").

// Colours live in the "--promo-*" block in src/index.css.
const TONES = {
  rose: {
    panel: 'bg-[var(--promo-rose)]',
    copy: 'items-center text-center',
    title: 'text-[var(--promo-rose-ink)]',
    description: 'text-[var(--promo-rose-ink)]',
    button:
      'bg-[var(--promo-rose-cta-bg)] text-[var(--promo-rose-cta-text)] hover:opacity-90',
    // Photo on the left, so the veil builds up towards the copy on the right.
    veilPhotoLeft:
      'bg-[linear-gradient(180deg,transparent_0%,var(--promo-rose-veil-soft)_16%,var(--promo-rose-veil)_42%)] sm:bg-[linear-gradient(90deg,transparent_0%,var(--promo-rose-veil-soft)_22%,var(--promo-rose-veil)_50%)]',
    veilPhotoRight:
      'bg-[linear-gradient(180deg,transparent_0%,var(--promo-rose-veil-soft)_16%,var(--promo-rose-veil)_42%)] sm:bg-[linear-gradient(270deg,transparent_0%,var(--promo-rose-veil-soft)_22%,var(--promo-rose-veil)_50%)]',
  },
  olive: {
    panel: 'bg-[var(--promo-olive)]',
    copy: 'items-start text-left',
    title: 'text-[var(--promo-olive-ink)]',
    description: 'text-[var(--promo-olive-muted)]',
    button:
      'bg-[var(--promo-olive-cta-bg)] text-[var(--promo-olive-cta-text)] hover:opacity-90',
    veilPhotoLeft:
      'bg-[linear-gradient(180deg,transparent_0%,var(--promo-olive-veil-soft)_16%,var(--promo-olive-veil)_42%)] sm:bg-[linear-gradient(90deg,transparent_0%,var(--promo-olive-veil-soft)_22%,var(--promo-olive-veil)_50%)]',
    veilPhotoRight:
      'bg-[linear-gradient(180deg,transparent_0%,var(--promo-olive-veil-soft)_16%,var(--promo-olive-veil)_42%)] sm:bg-[linear-gradient(270deg,transparent_0%,var(--promo-olive-veil-soft)_22%,var(--promo-olive-veil)_50%)]',
  },
};

export default function PromoBanner() {
  const items = useContentList('home.promo.items');

  if (items.length === 0) return null;

  return (
    <section className="w-full bg-background py-4 sm:py-6">
      <ul className="mx-auto grid w-full max-w-[1900px] gap-4 px-5 sm:px-8 lg:grid-cols-2 lg:gap-5 lg:px-10">
        {items.map((item) => {
          const tone = TONES[item.tone] ?? TONES.rose;
          const photoOnLeft = item.imageSide === 'left';

          return (
            <li key={item.id}>
              <article
                className={`relative isolate h-full overflow-hidden rounded-2xl ${tone.panel}`}
              >
                {/* One photo spans the whole card, behind the copy. */}
                <FallbackImage
                  src={item.image}
                  fallbackSrc={item.imageFallback}
                  alt={item.imageAlt ?? ''}
                  loading="lazy"
                  style={{ objectPosition: item.imagePosition ?? '50% 50%' }}
                  className="absolute inset-0 -z-20 h-full w-full object-cover"
                />

                <span
                  aria-hidden="true"
                  className={`absolute inset-0 -z-10 ${
                    photoOnLeft ? tone.veilPhotoLeft : tone.veilPhotoRight
                  }`}
                />

                <div className="grid h-full min-h-[240px] sm:min-h-[230px] sm:grid-cols-2">
                  <div
                    className={`flex flex-col justify-end gap-3 p-6 pb-8 sm:justify-center sm:p-7 lg:p-8 ${tone.copy} ${
                      photoOnLeft ? 'sm:col-start-2' : ''
                    }`}
                  >
                    <h2
                      className={`font-serif text-2xl font-medium leading-tight tracking-tight sm:text-[26px] lg:text-[30px] ${tone.title}`}
                    >
                      {item.title}
                    </h2>

                    {item.description && (
                      <p className={`text-sm leading-6 sm:text-[15px] ${tone.description}`}>
                        {item.description}
                      </p>
                    )}

                    <Link
                      to={item.buttonHref}
                      className={`mt-1 inline-flex min-h-11 items-center gap-3 rounded-full px-6 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${tone.button}`}
                    >
                      {item.buttonLabel}
                      <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
