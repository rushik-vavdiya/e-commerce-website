import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import FallbackImage from '../common/FallbackImage';
import { useContent, useContentList } from '../../hooks/useSiteContent';

// Copy, button and photo come from src/data/siteContent.json (key "home.hero").
// The colours live in the "--hero-*" block in src/index.css.
//
// A light studio banner, as in the design: one photo fills the band untouched —
// no wash over the whole section and no card around the copy. The words sit
// straight on the photo, held off the fabric by a soft text shadow only.

// The first button is the filled maroon pill; any further button is the outlined
// one. Spelled out here so the pills follow the hero palette.
const buttonStyles = {
  primary:
    'bg-[var(--hero-cta-bg)] text-[var(--hero-cta-text)] hover:bg-[var(--hero-cta-bg-hover)]',
  outline:
    'border border-[var(--hero-cta-bg)] text-[var(--hero-cta-bg)] hover:bg-[var(--hero-cta-bg)] hover:text-[var(--hero-cta-text)]',
};

// The section itself carries no background colour: the photo sits on a negative
// layer, so an opaque section background would paint straight over it.
export default function Hero() {
  // Content comes from the store (seeded from siteContent.json), so the band
  // re-renders if the wording is ever replaced at runtime.
  const hero = useContent('home.hero', {});
  const buttons = useContentList('home.hero.buttons');

  return (
    <section className="rv-hero relative isolate w-full overflow-hidden">
      <FallbackImage
        src={hero.image}
        fallbackSrc={hero.imageFallback}
        alt={hero.imageAlt}
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_center] sm:object-center"
      />

      {/* Same 1900px container and the same gutters as every other home band,
          so the hero copy lines up with the headings below it. */}
      <div className="mx-auto flex min-h-[440px] w-full max-w-[1900px] items-center px-5 py-12 sm:min-h-[500px] sm:px-8 lg:min-h-[540px] lg:px-10 xl:min-h-[580px]">
        {/* The copy carries no card: a white highlight shadow around the words
            is what holds them off the photo, so nothing is boxed in. */}
        <div className="rv-hero-content w-full max-w-[520px] motion-safe:animate-hero-reveal [&_h1]:[text-shadow:0_0_24px_rgba(255,255,255,0.9),0_2px_14px_rgba(255,255,255,0.95),0_1px_3px_rgba(255,255,255,1)] [&_p]:[text-shadow:0_0_16px_rgba(255,255,255,0.85),0_2px_10px_rgba(255,255,255,0.95),0_1px_2px_rgba(255,255,255,1)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--hero-eyebrow)] sm:text-xs">
            {hero.eyebrow}
          </p>

          <h1 className="mt-4 font-serif text-[34px] font-medium leading-[1.08] tracking-tight text-[var(--hero-title)] sm:text-[44px] lg:text-[54px] xl:text-[60px]">
            {hero.titleLine1}
            <span className="block text-[var(--hero-title-accent)]">{hero.titleHighlight}</span>
          </h1>

          <p className="mt-5 max-w-[420px] text-sm leading-7 text-[var(--hero-text)] sm:text-base">
            {hero.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
            {buttons.map((button) => (
              <Link
                key={button.id}
                to={button.href}
                className={[
                  'inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-sm font-semibold transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hero-cta-bg)] focus-visible:ring-offset-2',
                  buttonStyles[button.style] ?? buttonStyles.primary,
                ].join(' ')}
              >
                {button.label}
                <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
