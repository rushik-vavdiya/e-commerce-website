import Category from "../category/category.model.js";

// The rail order from the design. Slugs not named here still appear — after
// these, alphabetically — so a new department is never hidden from the menu.
const RAIL_ORDER = ["3-piece", "2-piece", "1-piece", "cord-set"];

// Products carry no dedicated "type" field. The sub-line under each name in the
// panel is read from the product's own specification list ("Work", "Print",
// "Fabric", …), and falls back to the first specification it does have.
//
// Specification values are full sentences ("Rose and leaf print, printed button
// placket"), so the label is cut at the first comma and capped: the row is one
// line tall and must never push the product name out of the way.
const SHORT_LABEL = 34;

const typeOf = (product) => {
  const specs = product.specifications ?? [];
  const named = specs.find((spec) => /type|work|print|pattern|fabric/i.test(spec.key ?? ""));
  const value = named?.value ?? specs[0]?.value;

  if (!value) return null;

  const first = String(value).split(/[,;(]/)[0].trim();

  return first.length > SHORT_LABEL ? `${first.slice(0, SHORT_LABEL - 1).trimEnd()}…` : first;
};

const orderFor = (slug) => {
  const index = RAIL_ORDER.indexOf(slug);
  return index === -1 ? RAIL_ORDER.length : index;
};

export const menuRepository = {
  // One aggregation for the whole rail: every live top-level department, the
  // number of active products it holds, and only the newest few of them.
  //
  // A product appears under a department when it is that product's main
  // category) or when the department is one of its extra categories, which is
  // the same rule the shop page's category filter uses.
  getCollections: async ({ limit = 6 } = {}) => {
    const rows = await Category.aggregate([
      { $match: { status: "active", level: 0 } },
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$status", "active"] },
                    {
                      $or: [
                        { $eq: ["$categoryId", "$$categoryId"] },
                        { $in: ["$$categoryId", { $ifNull: ["$categoryIds", []] }] },
                      ],
                    },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1, _id: -1 } },
            {
              $project: {
                name: 1,
                mainImage: 1,
                specifications: { $ifNull: ["$productSpecifications", []] },
              },
            },
          ],
          as: "items",
        },
      },
      {
        $project: {
          _id: 0,
          category: "$name",
          slug: 1,
          count: { $size: "$items" },
          products: { $slice: ["$items", limit] },
        },
      },
    ]);

    return rows
      .map((row) => ({
        category: row.category,
        slug: row.slug,
        count: row.count,
        products: (row.products ?? []).map((product) => ({
          _id: product._id,
          name: product.name,
          // The model stores a single main image, not an images[] array.
          image: product.mainImage ?? null,
          type: typeOf(product),
        })),
      }))
      .sort(
        (first, second) =>
          orderFor(first.slug) - orderFor(second.slug) ||
          first.category.localeCompare(second.category),
      );
  },
};

export default menuRepository;
