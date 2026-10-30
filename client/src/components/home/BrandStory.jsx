import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import FallbackImage from '../common/FallbackImage';
import { useContent } from '../../hooks/useSiteContent';

// The band the mockup puts just above the newsletter: a photo, a short story
// about the label and a link to the About page. Copy and photo come from
// src/data/siteContent.json (key "home.brandStory").
export default function BrandStory() {
  const story = useContent('home.brandStory', {});

  if (!story.title) return null;

  return (
    <section className="w-full bg-background py-10 sm:py-12 lg:py-14">
      <div className="mx-auto grid w-full max-w-[1900px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-14 lg:px-10">
        <FallbackImage
          src={story.image}
          fallbackSrc={story.imageFallback}
          alt={story.imageAlt}
          loading="lazy"
          className="h-56 w-full rounded-2xl object-cover object-top sm:h-72 lg:h-[330px]"
        />

        <div className="max-w-xl">
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl lg:text-[42px]">
            {story.title}
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {story.description}
          </p>

          {story.buttonLabel && (
            <Link
              to={story.buttonHref ?? '/about'}
              className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {story.buttonLabel}
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
