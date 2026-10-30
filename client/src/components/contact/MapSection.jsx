import { ExternalLink, MapPin, Navigation, Clock } from 'lucide-react';

import Container from '../common/Container';
import FallbackImage from '../common/FallbackImage';
import GoogleMap from '../common/GoogleMap';
import { directionsLink, getContent } from '../../data/content';
import { SUPPORT } from '../../data/siteInfo';

// The heading and the photo come from src/data/siteContent.json (key
// "contact.map"); the address itself comes from the "support" block.
const map = getContent('contact.map', {});

// Opens Google Maps turn-by-turn directions to the studio address in a new tab.
const directionsUrl = directionsLink(SUPPORT.address);

export default function MapSection() {
  const { eyebrow, title, description } = map;
  const photo = map.photo;

  return (
    <section className="w-full bg-background pb-14 sm:pb-16 lg:pb-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-primary sm:text-4xl">
            {title}
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            {description}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {/* Studio photo with the address overlaid and a directions button. */}
          <div className="relative isolate min-h-[320px] w-full overflow-hidden rounded-3xl border border-border lg:w-[38%]">
            <FallbackImage
              src={photo}
              fallbackSrc={map.photoFallback}
              alt={map.photoAlt}
              className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/20" />

            <div className="relative flex h-full flex-col justify-end gap-4 p-6 sm:p-7">
              <p className="flex items-start gap-3 text-sm leading-6 text-white">
                <MapPin
                  size={19}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-peach"
                />
                <span>
                  <span className="font-medium">{map.addressLabel}</span>
                  <br />
                  <span className="text-white/85">{SUPPORT.address}</span>
                </span>
              </p>

              <p className="flex items-start gap-3 text-sm leading-6 text-white">
                <Clock
                  size={19}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-peach"
                />
                <span className="text-white/85">{SUPPORT.hours}</span>
              </p>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-peach focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <Navigation size={16} strokeWidth={1.9} aria-hidden="true" />
                {map.directionsLabel}
              </a>
            </div>
          </div>

          {/* Live Google Maps embed. */}
          <div className="w-full lg:flex-1">
            <GoogleMap className="h-full" minHeight={320} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-xs text-muted sm:text-sm">
            {map.preferMapText}{' '}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-semibold text-accent transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {map.openInMapsLabel}
              <ExternalLink size={14} strokeWidth={1.9} aria-hidden="true" />
            </a>
          </p>

          <p className="text-xs text-muted sm:text-right">
            {map.appointmentsLabel}: {SUPPORT.email}
          </p>
        </div>
      </Container>
    </section>
  );
}
