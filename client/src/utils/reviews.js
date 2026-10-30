// Small helpers shared by every review component (product, vendor and website
// reviews all return the same shape: a `userId` object plus rating and dates).

// "Asha Menon", or "Customer" when the API did not populate the author.
export const reviewerName = (review) => {
  const reviewer = review?.userId ?? {};
  const name = `${reviewer.firstName ?? ''} ${reviewer.lastName ?? ''}`.trim();

  return name || 'Customer';
};

// The text of a review. Some rows carry a title and no comment, so either one
// can be the quote.
export const reviewQuote = (review) =>
  String(review?.comment ?? '').trim() || String(review?.title ?? '').trim();

// Counts per star level, highest first, for a rating breakdown bar row.
export const ratingBreakdown = (reviews = []) =>
  [5, 4, 3, 2, 1].map((value) => ({
    value,
    count: reviews.filter((review) => Number(review?.rating) === value).length,
  }));

// Average rating of a list, or 0 when the list is empty.
export const averageRating = (reviews = []) => {
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + Number(review?.rating ?? 0), 0);

  return total / reviews.length;
};
