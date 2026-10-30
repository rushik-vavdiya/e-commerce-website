// Admin lists load a capped array and then walk it in pages. The size matches
// the storefront listing (PER_PAGE on the shop page) so both pagers count the
// same way and an admin recognises the row at a glance.
export const ADMIN_PAGE_SIZE = 12;

// How many pages a list needs (never fewer than one, so the pager math has a
// real denominator while the data is still loading).
export function pageCount(total, perPage = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil((total ?? 0) / perPage));
}

// A list can shrink under the pager — a delete, a moderation decision, a
// filter — so the current page is clamped to the last page that really has
// rows instead of rendering an empty one.
export function clampPage(page, pages) {
  return Math.min(Math.max(1, page), Math.max(1, pages));
}

// The rows for one page, clamped, so callers can pass the raw page state.
export function pageSlice(items = [], page = 1, perPage = ADMIN_PAGE_SIZE) {
  const start = (clampPage(page, pageCount(items.length, perPage)) - 1) * perPage;
  return items.slice(start, start + perPage);
}

// Which page numbers a pager shows.
//
// The current page with one neighbour on each side, plus the first and last, so
// a long catalog reads « 1 … 4 5 6 … 12 » instead of a wall of numbers. Gaps are
// returned as the string "gap" for the caller to draw as an ellipsis.
const WINDOW = 1;

export function pageWindow(page, pages) {
  const wanted = new Set([1, pages]);

  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= pages) wanted.add(candidate);
  }

  const sorted = [...wanted].sort((a, b) => a - b);
  const rows = [];

  sorted.forEach((number, index) => {
    if (index > 0 && number - sorted[index - 1] > 1) rows.push('gap');
    rows.push(number);
  });

  return rows;
}
