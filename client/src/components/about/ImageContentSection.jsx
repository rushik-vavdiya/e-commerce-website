import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

import Button from '../common/Button';
import Container from '../common/Container';
import FallbackImage from '../common/FallbackImage';
import { getContent } from '../../data/content';

// The defaults come from src/data/siteContent.json (key "about.howWeWork"), so
// another page can drop this block in without repeating any copy.
const defaults = getContent('about.howWeWork', {});

// Reusable "image next to content" block. Flip the sides with `reverse`.
// Defaults come from src/data/siteContent.json (key "about.howWeWork").
export default function ImageContentSection({
  eyebrow: defaultEyebrow = defaults.eyebrow,
  title: defaultTitle = defaults.title,
  description: defaultDescription = defaults.description,
  image: defaultImage = defaults.image,
  imageFallback = defaults.imageFallback,
  imageAlt = defaults.imageAlt ?? '',
  points: defaultPoints = defaults.points ?? [],
  actionLabel = defaults.actionLabel,
  actionHref = defaults.actionHref,
  reverse = false,
}) {
  const eyebrow = defaultEyebrow;
  const title = defaultTitle;
  const description = defaultDescription;
  const image = defaultImage;
  const list = defaultPoints;

  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          className={`relative overflow-hidden rounded-3xl border border-border bg-peach/25 ${
            reverse ? 'lg:order-2' : ''
          }`}
        >
          <FallbackImage
            src={image}
            fallbackSrc={imageFallback}
            alt={imageAlt}
            loading="lazy"
            className="h-[320px] w-full object-cover object-center sm:h-[420px] lg:h-[520px]"
          />
        </div>

        <div className={reverse ? 'lg:order-1' : ''}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-primary sm:text-4xl">
            {title}
          </h2>

          <p className="mt-5 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {description}
          </p>

          <ul className="mt-7 flex flex-col gap-3">
            {list.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-peach/60 text-primary"
                >
                  <Check size={14} strokeWidth={2.1} />
                </span>

                <span className="text-sm leading-6 text-primary">{point}</span>
              </li>
            ))}
          </ul>

          <Link to={actionHref} className="mt-9 inline-flex">
            <Button variant="primary" size="lg" className="gap-3">
              {actionLabel}
              <ArrowRight size={18} strokeWidth={1.7} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
