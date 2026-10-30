// Contact details for the storefront.
//
// The values now come from src/data/siteContent.json (keys "support" and
// "whatsapp"), which is the single source of truth for the whole site, so the
// footer, the contact page and the floating WhatsApp button all stay in step.
// This module keeps the same named exports as before for code that already
// imports them.
import { getContent, whatsappLink as buildWhatsappLink } from './content';

export const SUPPORT = {
  email: getContent('support.email'),
  phone: getContent('support.phone'),
  hours: getContent('support.hours'),
  address: getContent('support.address'),
};

// International format, digits only — no "+" and no spaces. Edit the number in
// siteContent.json -> whatsapp.number.
export const WHATSAPP_NUMBER = getContent('whatsapp.number');

// Pre-filled message that opens in WhatsApp.
export const WHATSAPP_MESSAGE = getContent('whatsapp.message');

// Builds the wa.me link WhatsApp expects: https://wa.me/<number>?text=<message>
export const whatsappLink = buildWhatsappLink;
