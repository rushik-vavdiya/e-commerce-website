// Matching used by the navbar suggestions and the /search page.
//
// A query is split into words and every word has to appear somewhere in the
// row's text, in any order: "set kurti" finds "Kurti 3 Piece Set" just as
// "kurti set" does, and a page can be found by its keywords as well as its
// title. Products come from the API, which does its own matching over name,
// description and SKU — categories, collections, stores and pages are matched
// here.
export const queryWords = (value) =>
  String(value ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

const textOf = (values) =>
  values
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const matchesEveryWord = (text, words) => words.every((word) => text.includes(word));

const rankByPosition = (text, words) => {
  const positions = words.map((word) => text.indexOf(word));
  // Rows where the first word appears early read as better matches, so a search
  // for "kurti" puts "Kurti 1 Piece" above "Co-ord Set with kurti".
  return positions.reduce((total, position) => total + (position < 0 ? 999 : position), 0);
};

const searchRows = (rows, query, textFor, limit) => {
  const words = queryWords(query);
  if (words.length === 0) return [];

  return rows
    .map((row) => ({ row, text: textFor(row) }))
    .filter(({ text }) => matchesEveryWord(text, words))
    .sort((a, b) => rankByPosition(a.text, words) - rankByPosition(b.text, words))
    .slice(0, limit)
    .map(({ row }) => row);
};

// Live categories only: a draft category is not reachable from the storefront.
export const searchCategories = (categories = [], query, limit = 6) =>
  searchRows(
    categories.filter((category) => category?.status === 'active'),
    query,
    (category) =>
      textOf([category.name, category.slug, category.description, category.parentCategoryId?.name]),
    limit,
  );

export const searchPages = (pages = [], query, limit = 4) =>
  searchRows(pages, query, (page) => textOf([page.title, page.description, page.keywords]), limit);

// Collections are the homepage edits (Festive Wear, Office Wear, ...), matched on
// the same extra keywords the pages use.
export const searchCollections = (collections = [], query, limit = 3) =>
  searchRows(collections, query, (collection) =>
    textOf([collection.title, collection.description, collection.keywords]),
    limit,
  );

// Stores. GET /vendors/public already returns only approved, active stores, so
// there is nothing left to filter out here.
export const searchVendors = (vendors = [], query, limit = 3) =>
  searchRows(vendors, query, (vendor) =>
    textOf([vendor.storeName, vendor.storeDescription]),
    limit,
  );
