// Reading the variant data on a product.
//
// A product stores its options twice, the way the admin and vendor product forms
// write them:
//
//   variants:            [{ name: 'Colour', options: ['Plum'] },
//                         { name: 'Size',   options: ['XL', '2XL', …] }]
//   variantCombinations: [{ variantName: 'Plum / XL', price, stock, mainImage }]
//
// `variantName` joins the options of every variant in the order the variants are
// declared, so splitting it back apart has to follow the same order. Everything
// below reads those two arrays and never invents an option that is not there.

// "Colour" and "Color" are both accepted, since both are written by hand in the
// product forms.
const COLOUR_NAMES = ['colour', 'color'];
const SIZE_NAMES = ['size', 'sizes'];

const normalise = (value) => String(value ?? '').trim().toLowerCase();

export const variantNames = (product) =>
  (product?.variants ?? []).map((variant) => String(variant?.name ?? '').trim());

const findVariant = (product, names) =>
  (product?.variants ?? []).find((variant) => names.includes(normalise(variant?.name))) ?? null;

export const colourVariant = (product) => findVariant(product, COLOUR_NAMES);
export const sizeVariant = (product) => findVariant(product, SIZE_NAMES);

// { colour: 'Plum', size: 'XL' } for one combination, keyed by the variant names
// actually used on the product.
export const combinationParts = (combination, names = []) => {
  const parts = String(combination?.variantName ?? '').split(' / ');
  const result = {};

  names.forEach((name, index) => {
    result[normalise(name)] = parts[index] ?? '';
  });

  return result;
};

const valueFor = (product, combination, variant, names) =>
  variant ? combinationParts(combination, names)[normalise(variant.name)] : '';

// The photo slots the create form offers for variants: one per colour when the
// product is sold in colours, otherwise one per combination. Each slot lists every
// combination name the chosen photo is attached to, so a single photo covers all
// the sizes of that colour instead of the same file being picked again per size.
//
// Works on the arrays the product form holds before anything is saved, so it only
// reads `variants` and `variantCombinations` — no product record needed.
export const variantImageGroups = (variants = [], combinations = []) => {
  const list = (combinations ?? []).filter((item) => String(item?.variantName ?? '').trim());
  if (list.length === 0) return [];

  const names = (variants ?? []).map((variant) => String(variant?.name ?? '').trim());
  const colourIndex = names.findIndex((name) => COLOUR_NAMES.includes(normalise(name)));

  // No colour variant (a size-only product, say): every combination is its own
  // slot, which is the same thing the edit page shows.
  if (colourIndex === -1) {
    return list.map((item) => ({
      key: item.variantName,
      label: item.variantName,
      variantNames: [item.variantName],
    }));
  }

  const groups = new Map();

  for (const item of list) {
    const value = String(item.variantName).split(' / ')[colourIndex] ?? '';
    if (!value) continue;

    const group = groups.get(value) ?? { key: value, label: value, variantNames: [] };
    group.variantNames.push(item.variantName);
    groups.set(value, group);
  }

  return [...groups.values()];
};

// The colours a product is actually sold in, in the order they were entered, each
// with a photo (preferring a colour that is in stock) and its total stock.
export const productColours = (product) => {
  const colour = colourVariant(product);
  if (!colour) return [];

  const names = variantNames(product);
  const combinations = product?.variantCombinations ?? [];
  const colours = new Map();

  for (const option of colour.options ?? []) {
    colours.set(String(option), { name: String(option), image: null, stock: 0 });
  }

  for (const combination of combinations) {
    const value = valueFor(product, combination, colour, names);
    const entry = colours.get(value) ?? { name: value, image: null, stock: 0 };
    entry.stock += Number(combination.stock ?? 0);

    if (combination.mainImage && (combination.stock > 0 || !entry.image)) {
      entry.image = combination.mainImage;
    }

    colours.set(value, entry);
  }

  return [...colours.values()].filter((entry) => entry.name);
};

// Every size on the record, in the order it was entered, with the stock of that
// size for the chosen colour. A size with no combination at all is reported as
// stock 0 rather than being left out.
export const productSizes = (product, colour = null) => {
  const size = sizeVariant(product);
  if (!size) return [];

  const names = variantNames(product);
  const col = colourVariant(product);
  const combinations = product?.variantCombinations ?? [];

  return (size.options ?? []).map((option) => {
    const label = String(option);
    const combination =
      combinations.find(
        (item) =>
          valueFor(product, item, size, names) === label &&
          (!col || !colour || valueFor(product, item, col, names) === colour),
      ) ?? null;

    return { label, stock: Number(combination?.stock ?? 0), combination };
  });
};

// The one combination a product is added to the bag with when the shopper has
// not chosen anything yet: the first size that is actually in stock, preferring
// the first colour that is in stock.
export const defaultSelection = (product) => {
  const colours = productColours(product);
  const colour = colours.find((entry) => entry.stock > 0)?.name ?? colours[0]?.name ?? null;
  const sizes = productSizes(product, colour);
  const size = sizes.find((entry) => entry.stock > 0) ?? sizes[0] ?? null;

  return {
    colour,
    size: size?.label ?? null,
    combination: size?.combination ?? null,
    combinationId: size?.combination?._id ?? null,
  };
};

// Sizes in stock (across every colour), which is what a card shows. When nothing
// is in stock the full size list comes back with every entry at zero.
export const availableSizes = (product) => {
  const sizes = productSizes(product);
  const inStock = sizes.filter((entry) => entry.stock > 0);

  return inStock.length > 0 ? inStock : sizes;
};

// "XL–3XL" style summary used on the compact cards. Null when the product has no
// size variant at all.
export const sizeRange = (product) => {
  const sizes = availableSizes(product);
  if (sizes.length === 0) return null;

  const first = sizes[0].label;
  const last = sizes[sizes.length - 1].label;

  return {
    first,
    last,
    label: first === last ? first : `${first} – ${last}`,
    count: sizes.length,
  };
};
