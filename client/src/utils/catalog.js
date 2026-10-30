// Sort options for GET /api/products. The values mirror what the API's
// productQuerySchema accepts (see product.validator.js).

export const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low-high', label: 'Price: low to high' },
  { value: 'price-high-low', label: 'Price: high to low' },
  { value: 'az', label: 'Name: A to Z' },
];

export const DEFAULT_SORT = 'newest';
