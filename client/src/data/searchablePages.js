// The storefront's own pages, so the navbar search finds a page by the words a
// customer would use ("size guide", "track order", "returns") and not only
// products and categories. `keywords` are extra words the title alone would not
// match; the search itself lives in src/utils/search.js.
export const searchablePages = [
  {
    id: 'home',
    title: 'Home',
    href: '/',
    description: 'New arrivals, bestsellers and featured collections.',
    keywords: 'home homepage storefront start landing featured',
  },
  {
    id: 'shop',
    title: 'Shop all products',
    href: '/shop',
    description: 'The full catalog with filters and sorting.',
    keywords: 'shop all products catalog every sale offers bestsellers new arrivals',
  },
  {
    id: 'categories',
    title: 'Browse categories',
    href: '/shop',
    description: 'Departments and collections, from kurtis to co-ord sets.',
    keywords: 'categories departments collections browse kurti coord set dupatta',
  },
  {
    id: 'wishlist',
    title: 'My wishlist',
    href: '/wishlist',
    description: 'The products you saved for later.',
    keywords: 'wishlist saved favourites favorites heart',
  },
  {
    id: 'orders',
    title: 'My orders and tracking',
    href: '/account/orders',
    description: 'Track an order, or see what you bought before.',
    keywords: 'orders track order tracking delivery status shipment history invoice',
  },
  {
    id: 'about',
    title: 'About us',
    href: '/about',
    description: 'Our story, how we source, and where we work.',
    keywords: 'about story sustainability careers wholesale brand',
  },
  {
    id: 'contact',
    title: 'Contact us',
    href: '/contact',
    description: 'Reach the studio by phone, email or the form.',
    keywords: 'contact support help phone email address reach us wholesale enquiry',
  },
  {
    id: 'faq',
    title: 'FAQs, shipping and returns',
    href: '/faq',
    description: 'Answers on shipping, returns, exchanges and sizing.',
    keywords: 'faq questions help shipping returns exchange refund size guide policy',
  },
  {
    id: 'privacy',
    title: 'Privacy policy',
    href: '/privacy',
    description: 'What we store and how it is used.',
    keywords: 'privacy policy data personal information',
  },
  {
    id: 'terms',
    title: 'Terms & conditions',
    href: '/terms',
    description: 'The rules that apply when you shop with us.',
    keywords: 'terms conditions legal agreement',
  },
];
