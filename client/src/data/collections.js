import { listContent } from './content';

// The store's collections, taken from the homepage's featured collections in
// siteContent.json so a rename or a new collection shows up in search too. The
// ids and hrefs stay in the JSON; only the words a shopper would search for are
// written here, because a collection name alone ("Party Wear") would not match
// "wedding" or "evening".
const detailsById = {
  'casual-wear': {
    description: 'Easy everyday kurtis and daily-wear pieces.',
    keywords: 'casual everyday daily wear simple home comfort cotton kurti',
  },
  'office-wear': {
    description: 'Smart co-ord sets and tailored pieces for work.',
    keywords: 'office work formal smart tailoring co-ord coord set trousers desk',
  },
  'festive-wear': {
    description: 'Embellished sets for weddings, festivals and pujas.',
    keywords: 'festive festival wedding shaadi puja diwali eid embroidered two piece set',
  },
  'party-wear': {
    description: 'Statement three-piece sets for evenings out.',
    keywords: 'party evening cocktail reception statement three piece set dupatta',
  },
};

// The square "photo coming soon" mark reads as a broken image at thumbnail
// size, so a collection whose photo is missing falls back to the banner art
// instead. FallbackImage swaps it in only when the real file cannot load.
const BANNER_PLACEHOLDER = '/images/placeholder-banner.svg';

export const searchableCollections = listContent('home.featuredCollections.items').map(
  (collection) => ({
    id: collection.id,
    title: collection.name,
    href: collection.href,
    image: collection.image,
    imageFallback: BANNER_PLACEHOLDER,
    description:
      detailsById[collection.id]?.description ?? `The ${collection.name} edit.`,
    keywords: detailsById[collection.id]?.keywords ?? '',
  }),
);
