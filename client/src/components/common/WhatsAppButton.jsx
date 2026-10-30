import { getContent } from '../../data/content';
import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER, whatsappLink } from '../../data/siteInfo';

// lucide-react no longer ships brand icons, so the WhatsApp glyph is an inline
// SVG (same approach as the social icons in the footer).
function WhatsAppGlyph({ size = 26, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.115-.198.058-.371-.03-.52-.086-.148-.66-1.596-.905-2.185-.238-.574-.48-.497-.66-.505-.171-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Floating chat button, fixed to the bottom-right of the viewport and above the
// page content but below the cart drawer (z-40). The number, the pre-filled
// message and the label come from src/data/siteContent.json -> "whatsapp".
export default function WhatsAppButton({
  number = WHATSAPP_NUMBER,
  message = WHATSAPP_MESSAGE,
  label = getContent('whatsapp.label'),
  // Pages with their own form controls (the contact page) hide the floating
  // button and offer WhatsApp inline instead, so it never covers an input.
  hidden = false,
  className = '',
}) {
  if (hidden) return null;

  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${label} (opens in a new tab)`}
      title={`${label} — ${number}`}
      className={[
        // On phones the bottom nav bar owns the foot of the screen, so the
        // button rides above it; from lg the bar is gone and it returns.
        'fixed bottom-24 right-4 z-40 flex size-11 items-center justify-center rounded-full sm:size-13',
        'bg-[#25D366] text-white shadow-[0_14px_34px_rgba(122,46,31,0.30)]',
        'transition-colors duration-200 hover:bg-accent hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'sm:right-6 lg:bottom-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <WhatsAppGlyph size={24} />
    </a>
  );
}
