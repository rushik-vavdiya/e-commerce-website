// Shared display helpers for the whole client, so prices and dates look the
// same everywhere. Import these instead of copying a local formatter.

// Rupee amount, rounded to whole rupees (the catalog stores whole numbers).
export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

// Percentage off, or null when there is no real discount.
export const discountPercent = (price, comparePrice) => {
  const current = Number(price) || 0;
  const compare = Number(comparePrice) || 0;

  if (compare <= current) return null;

  return Math.round(((compare - current) / compare) * 100);
};

// "12 Mar 2026" — used by reviews, orders and admin tables.
export const formatDate = (value) => {
  if (!value) return '';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// "12 Mar 2026, 4:30 pm" — for rows that need the time as well.
export const formatDateTime = (value) => {
  if (!value) return '';

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// "March 2026" in small caps style, used under review author names.
export const formatMonth = (value) => {
  if (!value) return '';

  return new Date(value)
    .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    .toUpperCase();
};
