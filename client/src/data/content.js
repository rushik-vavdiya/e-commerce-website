// Read-only access to the site's content and to the section switches.
//
// All wording, images, button labels, the WhatsApp details and the map live in
// two plain JSON files next to this one:
//
//   siteContent.json       — every piece of text, image path and label
//   sectionVisibility.json — a true/false switch per section
//
// Components never hard-code copy; they ask for a dot path instead, e.g.
//   getContent('home.hero.titleLine1')   -> "Find Your"
//   listContent('footer.benefits')       -> [ { title, description, icon }, ... ]
//   isVisible('home.promo')              -> true | false
//
// To change a heading, a photo or a button label, edit the JSON — no component
// has to change. To hide a section, set its flag to false.

import sectionVisibility from './sectionVisibility.json';
import siteContent from './siteContent.json';

// Walks "a.b.c" through the JSON. Returns undefined when any step is missing.
// Exported so the Redux-backed hooks below can read the same tree the same way.
export const readPath = (source, path) => {
  if (!path) return source;

  return String(path)
    .split('.')
    .reduce((value, key) => {
      if (value === null || typeof value !== 'object') return undefined;

      return Object.prototype.hasOwnProperty.call(value, key)
        ? value[key]
        : undefined;
    }, source);
};

// The whole content tree, for code that wants to map over a branch itself.
// Home page bands read it through the content slice (src/slices/contentSlice.js)
// so the store is the one place that holds the wording at runtime.
export const content = siteContent;

// The whole visibility tree.
export const visibility = sectionVisibility;

// getContent('home.hero', {}) — a single value, or `fallback` when it is absent.
export const getContent = (path, fallback = '') => {
  const value = readPath(content, path);

  return value === undefined ? fallback : value;
};

// listContent('faq.groups') — always an array, so .map()/.length are safe.
export const listContent = (path) => {
  const value = readPath(content, path);

  return Array.isArray(value) ? value : [];
};

// isVisible('home.promo') — the section switch. Anything missing from
// sectionVisibility.json is visible, so a new section shows up by default.
export const isVisible = (path, fallback = true) => {
  const value = readPath(sectionVisibility, path);

  return typeof value === 'boolean' ? value : fallback;
};

// Builds the wa.me link WhatsApp expects: https://wa.me/<number>?text=<message>
export const whatsappLink = (
  number = getContent('whatsapp.number'),
  message = getContent('whatsapp.message'),
) => {
  const digits = String(number).replace(/\D/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';

  return `https://wa.me/${digits}${text}`;
};

// Opens Google Maps turn-by-turn directions to any address.
export const directionsLink = (query = getContent('support.address')) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
