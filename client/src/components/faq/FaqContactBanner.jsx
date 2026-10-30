import Container from '../common/Container';
import FallbackImage from '../common/FallbackImage';
import { getContent, listContent } from '../../data/content';
import { whatsappLink } from '../../data/siteInfo';
import { contentIcon } from '../../utils/contentIcons';

// The heading, the photo and the three channels come from
// src/data/siteContent.json (key "faq.contactBanner"). A channel that names a
// "source" shows the matching value from the "support" block instead of
// repeating the email address or phone number here.
const banner = getContent('faq.contactBanner', {});
const channels = listContent('faq.contactBanner.channels');
const support = getContent('support', {});
const whatsappNumber = getContent('whatsapp.number');

const valueFor = (channel) => {
  switch (channel.source) {
    case 'email':
      return support.email;
    case 'phone':
      return support.phone;
    default:
      return channel.value;
  }
};

const hrefFor = (channel) => {
  switch (channel.hrefType) {
    case 'email':
      return `mailto:${support.email}`;
    case 'phone':
      return `tel:${String(support.phone).replace(/\s/g, '')}`;
    case 'whatsapp':
      return whatsappLink();
    default:
      return null;
  }
};

// Closing contact banner. A short band on purpose: the copy sits on the left and
// the three ways to reach the studio sit on the right, beside the call to action,
// so the whole strip stays close to 200px tall instead of stacking into a column.
// The channels stay in siteContent.json because they read the support details.
export default function FaqContactBanner() {
  const copy = banner;

  return (
    <section className="relative isolate w-full overflow-hidden">
      <FallbackImage
        src={copy.image}
        fallbackSrc={banner.imageFallback}
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/60" />

      <Container className="relative flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-12">
        {/* Copy */}
        <div className="max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-peach">
            {copy.eyebrow}
          </p>

          <h2 className="mt-2.5 font-serif text-2xl font-medium leading-tight tracking-tight text-white sm:text-3xl">
            {copy.title}
          </h2>

          <p className="mt-2.5 max-w-md text-sm leading-6 text-white/85">
            {copy.description}
          </p>
        </div>

        {/* The three channels are the whole action here: the old "Contact us"
            button repeated the email and WhatsApp links beside it, so it is gone. */}
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
          <ul className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
            {channels.map((channel) => {
              const Icon = contentIcon(channel.icon);
              const value = valueFor(channel);
              const href = hrefFor(channel);

              return (
                <li key={channel.id}>
                  <a
                    href={href}
                    target={channel.external ? '_blank' : undefined}
                    rel={channel.external ? 'noreferrer noopener' : undefined}
                    aria-label={
                      channel.external
                        ? `${channel.label} — ${whatsappNumber} (opens in a new tab)`
                        : `${channel.label}: ${value}`
                    }
                    className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-sm transition-colors hover:border-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:py-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-peach"
                    >
                      <Icon size={14} strokeWidth={1.8} />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/65">
                        {channel.label}
                      </span>

                      <span className="block whitespace-nowrap text-[13px] font-medium leading-5 text-white">
                        {value}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
