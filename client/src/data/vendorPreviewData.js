// ---------------------------------------------------------------------------
// DEMO DATA — used only by the public /vendor-preview route.
// ---------------------------------------------------------------------------
// Nothing here comes from the API and nothing here is written back to it. The
// preview is a UI inspection aid, so the records below are invented and every
// screen that renders them says so. Real vendor screens read GET /vendors/me and
// GET /products with the signed-in vendor's own token.
// ---------------------------------------------------------------------------

export const PREVIEW_NOTICE =
  'Demo data only. This preview is not connected to any account, calls no API and can change nothing — real product, order and vendor operations stay behind the normal authentication and role checks.';

export const demoPreviewUser = {
  firstName: 'Demo',
  lastName: 'Vendor',
  email: 'demo.vendor@example.com',
  phone: '+91 90000 00000',
  role: 'vendor',
  status: 'active',
  emailVerified: true,
  createdAt: '2026-01-12T09:00:00.000Z',
};

export const demoPreviewVendor = {
  _id: 'demo-vendor-record',
  storeName: 'Demo Studio Samples',
  storeDescription:
    'Demo storefront record for layout inspection. It shows how a store profile, its description and its contact details appear in the vendor dashboard.',
  storeAddress: 'Demo address, Sample Street, Mumbai',
  storeContact: '+91 90000 00000',
  storeEmail: 'demo.store@example.com',
  storeSocial: { instagram: 'https://instagram.com/', website: 'https://example.com/' },
  approvalStatus: 'pending',
  status: 'inactive',
  rejectionReason: null,
  createdAt: '2026-01-12T09:00:00.000Z',
};

export const demoPreviewCategories = [
  { _id: 'demo-category-women', name: 'Women', status: 'active' },
  { _id: 'demo-category-men', name: 'Men', status: 'active' },
  { _id: 'demo-category-draft', name: 'Coming Soon', status: 'draft' },
];

export const demoPreviewProducts = [
  {
    _id: 'demo-product-1',
    name: 'Demo Linen Oversized Shirt',
    description: 'Sample row: a relaxed linen shirt used to show the product list.',
    price: 1899,
    comarePrice: 2499,
    stock: 18,
    sku: 'DEMO-001',
    status: 'draft',
    categoryId: 'demo-category-men',
    ratingAverage: 4.6,
    reviewCount: 4,
    mainImage: '/images/placeholder.svg',
    productSpecifications: [
      { key: 'Material', value: '55% linen, 45% viscose' },
      { key: 'Fit', value: 'Oversized' },
      { key: 'Care', value: 'Gentle machine wash' },
    ],
  },
  {
    _id: 'demo-product-2',
    name: 'Demo Pleated Midi Dress',
    description: 'Sample row: a published product with variant stock.',
    price: 3199,
    comarePrice: 3999,
    stock: 0,
    sku: 'DEMO-002',
    status: 'active',
    categoryId: 'demo-category-women',
    ratingAverage: 4.8,
    reviewCount: 2,
    mainImage: '/images/placeholder.svg',
    productSpecifications: [
      { key: 'Material', value: 'Recycled crepe' },
      { key: 'Fit', value: 'Fitted waist, flared skirt' },
    ],
    variantCombinations: [
      { _id: 'demo-variant-1', variantName: 'Small', price: 3199, stock: 4 },
      { _id: 'demo-variant-2', variantName: 'Medium', price: 3199, stock: 0 },
    ],
  },
  {
    _id: 'demo-product-3',
    name: 'Demo Cotton Tee',
    description: 'Sample row: a product with no image, to show the empty image state.',
    price: 899,
    stock: 0,
    status: 'active',
    categoryId: 'demo-category-women',
    ratingAverage: 0,
    reviewCount: 0,
    mainImage: null,
    productSpecifications: [],
  },
];

export const demoPreviewReviewGroups = [
  {
    productId: 'demo-product-2',
    productName: 'Demo Pleated Midi Dress',
    status: 'active',
    ratingAverage: 4.8,
    reviews: [
      {
        _id: 'demo-review-1',
        rating: 5,
        title: 'Sample review title',
        comment:
          'Demo review text used to show how an approved customer review appears in the vendor reviews screen.',
        verifiedPurchase: true,
        createdAt: '2026-02-02T10:00:00.000Z',
        userId: { firstName: 'Demo', lastName: 'Reviewer' },
      },
      {
        _id: 'demo-review-2',
        rating: 4,
        title: '',
        comment:
          'Another demo review. Real reviews only reach this screen after an admin approves them.',
        verifiedPurchase: true,
        createdAt: '2026-02-09T10:00:00.000Z',
        userId: { firstName: 'Sample', lastName: 'Customer' },
      },
    ],
  },
];
