import Container from '../common/Container';
import FallbackImage from '../common/FallbackImage';
import { getContent, listContent } from '../../data/content';

// The heading and the photo mosaic come from src/data/siteContent.json
// (key "about.gallery"). Every tile falls back to a bundled image if the
// dedicated gallery file is not there yet, so the grid never shows a gap.
const gallery = getContent('about.gallery', {});
const shots = listContent('about.gallery.shots');

export default function AboutGallery() {
  const { eyebrow, title, description } = gallery;

  return (
    <section className="w-full bg-background py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-primary sm:text-4xl">
            {title}
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {description}
          </p>
        </div>

        <div className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-4 sm:auto-rows-[190px] lg:auto-rows-[220px] lg:grid-cols-4 lg:gap-5">
          {shots.map(({ id, caption, image, imageFallback, alt, className, position }) => (
            <figure
              key={id}
              className={[
                'group relative isolate overflow-hidden rounded-3xl border border-border bg-peach/25',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* `position` lets a tile pick which part of its photograph
                  survives the crop — the wide studio shot is mostly wall at
                  its centre, the rail sits to the right. */}
              <FallbackImage
                src={image}
                fallbackSrc={imageFallback}
                alt={alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                style={position ? { objectPosition: position } : undefined}
              />

              <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />

              <figcaption className="absolute inset-x-0 bottom-0 z-10 p-5 text-sm font-medium text-white sm:p-6">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
