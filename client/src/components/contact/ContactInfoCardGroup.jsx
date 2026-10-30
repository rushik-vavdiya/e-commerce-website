import { getContent, listContent } from '../../data/content';
import { whatsappLink } from '../../data/siteInfo';
import { contentIcon } from '../../utils/contentIcons';

// The cards come from src/data/siteContent.json (key "contact.infoCards").
// A card that names a "source" (email / phone / address / hours) shows the
// matching value from the "support" block and gets its link from "hrefType",
// so the email address or phone number is still edited in exactly one place.
const cards = listContent('contact.infoCards');
const support = getContent('support', {});
const whatsappNumber = getContent('whatsapp.number');

const valueFor = (card) => {
  switch (card.source) {
    case 'email':
      return support.email;
    case 'phone':
      return support.phone;
    case 'address':
      return support.address;
    case 'hours':
      return support.hours;
    default:
      return card.value;
  }
};

const hrefFor = (card) => {
  switch (card.hrefType) {
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

export default function ContactInfoCardGroup({ className = '' }) {
  return (
    <ul
      className={[
        'grid gap-3 sm:grid-cols-2 lg:grid-cols-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {cards.map((card) => {
        const Icon = contentIcon(card.icon);
        const value = valueFor(card);
        const href = hrefFor(card);

        const content = (
          <>
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-peach bg-peach/40 text-primary"
            >
              <Icon size={18} strokeWidth={1.7} />
            </span>

            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                {card.label}
              </span>

              <span className="mt-0.5 block break-words text-sm font-medium leading-5 text-primary">
                {value}
              </span>

              <span className="mt-0.5 block text-xs text-muted">{card.hint}</span>
            </span>
          </>
        );

        return (
          <li key={card.id}>
            {href ? (
              <a
                href={href}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noreferrer noopener' : undefined}
                aria-label={
                  card.external
                    ? `${card.label} — ${whatsappNumber} (opens in a new tab)`
                    : undefined
                }
                className="flex h-full items-start gap-3.5 rounded-2xl border border-border bg-white px-4 py-4 transition-colors duration-200 hover:border-accent hover:shadow-[0_12px_30px_-16px_rgba(122,46,31,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {content}
              </a>
            ) : (
              <div className="flex h-full items-start gap-3.5 rounded-2xl border border-border bg-white px-4 py-4">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
