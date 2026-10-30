// Seeds the "Kurti" department exactly like the store's other real data:
// one top-level category with three sub-categories (1-piece kurti, 2-piece
// kurta set, co-ord set) and nine products spread across them, every field
// filled and no images.
//
// Usage:  node src/scripts/seed-kurti-category.js
// Idempotent: looks up categories by slug and products by SKU before creating.
import mongoose from "mongoose";
import Vendor from "../modules/vendor/vendor.model.js";
import Category from "../modules/category/category.model.js";
import Product from "../modules/product/product.model.js";
import connectDB from "../config/db.js";

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function getVendor() {
  // The approved stores created by the main seed keep their products here.
  let vendor = await Vendor.findOne({ storeName: "Loom & Lane" });
  if (vendor) return vendor;

  // Nothing to hang a store on (script run standalone): reuse any approved
  // vendor, or leave the products vendor-less like admin-created ones.
  vendor = await Vendor.findOne({ approvalStatus: "approved", status: "active" });
  return vendor ?? null;
}

const KURTI_TREE = [
  {
    name: "Kurti",
    slug: "kurti",
    level: 0,
    description: "Kurtis and matching sets for every occasion.",
    subs: [
      {
        name: "Kurti 1 Piece",
        slug: "kurti-1-piece",
        description: "Single kurtis to style your way.",
      },
      {
        name: "Kurti 2 Piece Set",
        slug: "kurti-2-piece-set",
        description: "Kurti with a matching bottom, sold together.",
      },
      {
        name: "Co-ord Set",
        slug: "coord-set",
        description: "Matching top and bottom sets with a modern cut.",
      },
    ],
  },
];

const PRODUCTS = [
  // -------- Kurti 1 Piece --------
  {
    sku: "KT1-01",
    name: "Anarkali Cotton Kurti",
    price: 1099,
    comarePrice: 1499,
    stock: 25,
    sub: "kurti-1-piece",
    description:
      "A flared Anarkali-cut kurti in breathable cotton with a printed yoke. Falls below the knee and pairs with leggings or jeans.",
    specs: [
      ["Material", "100% cotton"],
      ["Length", "Below knee"],
      ["Sleeve", "Three-quarter"],
      ["Care", "Machine wash cold"],
    ],
  },
  {
    sku: "KT1-02",
    name: "Chikankari Straight Kurti",
    price: 1299,
    comarePrice: 0,
    stock: 18,
    sub: "kurti-1-piece",
    description:
      "A straight-cut kurti with all-over chikankari-style embroidery. Lightweight fabric with a side-slit hem.",
    specs: [
      ["Material", "Cotton blend"],
      ["Embroidery", "Chikankari style"],
      ["Length", "Knee"],
      ["Care", "Hand wash"],
    ],
  },
  {
    sku: "KT1-03",
    name: "A-line Rayon Kurti",
    price: 899,
    comarePrice: 1199,
    stock: 30,
    sub: "kurti-1-piece",
    description:
      "An easy A-line kurti in soft rayon. Round neck, three-quarter sleeves and pockets on both sides.",
    specs: [
      ["Material", "Rayon"],
      ["Fit", "A-line"],
      ["Pockets", "Yes"],
      ["Care", "Machine wash"],
    ],
  },

  // -------- Kurti 2 Piece Set --------
  {
    sku: "KT2-04",
    name: "Kurti With Palazzo Set",
    price: 1899,
    comarePrice: 2399,
    stock: 20,
    sub: "kurti-2-piece-set",
    description:
      "A printed straight kurti with matching flared palazzos. Same-fabric set that looks put together with zero effort.",
    specs: [
      ["Pieces", "Kurti + palazzo"],
      ["Material", "Rayon blend"],
      ["Print", "Floral"],
      ["Care", "Machine wash cold"],
    ],
  },
  {
    sku: "KT2-05",
    name: "Straight Kurti Pant Set",
    price: 1699,
    comarePrice: 2199,
    stock: 22,
    sub: "kurti-2-piece-set",
    description:
      "A solid straight kurti with tapered pants and a printed dupatta-style trim on the sleeves. Office-friendly and comfy.",
    specs: [
      ["Pieces", "Kurti + pant"],
      ["Material", "Cotton flex"],
      ["Fit", "Straight"],
      ["Care", "Machine wash"],
    ],
  },
  {
    sku: "KT2-06",
    name: "Festive Sharara Set",
    price: 2799,
    comarePrice: 3799,
    stock: 10,
    sub: "kurti-2-piece-set",
    description:
      "A short flared kurti over sharara pants with gota detailing. Made for mehendi mornings and festive evenings.",
    specs: [
      ["Pieces", "Kurti + sharara"],
      ["Detail", "Gota trim"],
      ["Occasion", "Festive"],
      ["Care", "Dry clean"],
    ],
  },

  // -------- Co-ord Set --------
  {
    sku: "CRD-07",
    name: "Linen Co-ord Set",
    price: 2199,
    comarePrice: 2899,
    stock: 15,
    sub: "coord-set",
    description:
      "A relaxed shirt and wide-leg trouser in washed linen. Wear together or split across the week.",
    specs: [
      ["Pieces", "Shirt + trouser"],
      ["Material", "100% linen"],
      ["Fit", "Relaxed"],
      ["Care", "Machine wash cold"],
    ],
  },
  {
    sku: "CRD-08",
    name: "Printed Cotton Co-ord",
    price: 1799,
    comarePrice: 2499,
    stock: 19,
    sub: "coord-set",
    description:
      "A cropped top and matching midi skirt in a summer print. Elasticated waist keeps it easy all day.",
    specs: [
      ["Pieces", "Top + skirt"],
      ["Material", "Cotton poplin"],
      ["Waist", "Elasticated"],
      ["Care", "Machine wash"],
    ],
  },
  {
    sku: "CRD-09",
    name: "Knit Lounge Co-ord",
    price: 1599,
    comarePrice: 0,
    stock: 26,
    sub: "coord-set",
    description:
      "A soft knit tee and drawstring pants for slow days. Ribbed trims and a loungewear fit.",
    specs: [
      ["Pieces", "Tee + pants"],
      ["Material", "Ribbed knit blend"],
      ["Waist", "Drawstring"],
      ["Care", "Machine wash"],
    ],
  },
];

const run = async () => {
  await connectDB();

  // ---- Category tree (idempotent by slug) ----
  const created = {};
  for (const node of KURTI_TREE) {
    const [parent] = [
      (await Category.findOne({ slug: node.slug })) ??
        (await Category.create({
          name: node.name,
          description: node.description,
          slug: node.slug,
          parentCategoryId: null,
          level: node.level,
          status: "active",
        })),
    ];

    node.parent = parent;
    for (const sub of node.subs) {
      const existing = await Category.findOne({ slug: sub.slug });
      created[sub.slug] =
        existing ??
        (await Category.create({
          name: sub.name,
          description: sub.description,
          slug: sub.slug,
          parentCategoryId: parent._id,
          level: node.level + 1,
          status: "active",
        }));
    }
  }

  const vendor = await getVendor();

  // ---- Products (idempotent by SKU) ----
  const made = [];
  for (const [index, plan] of PRODUCTS.entries()) {
    const existing = await Product.findOne({ sku: plan.sku });
    if (existing) {
      made.push(existing);
      continue;
    }

    const subCategory = created[plan.sub];
    const createdAt = daysAgo(2 + index * 3);

    made.push(
      await Product.create({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        comarePrice: plan.comarePrice || undefined,
        stock: plan.stock,
        sku: plan.sku,
        categoryId: subCategory._id,
        categoryIds: [subCategory._id, KURTI_TREE[0].parent._id],
        vendorId: vendor?._id ?? null,
        status: "active",
        productSpecifications: plan.specs.map(([key, value]) => ({ key, value })),
        ratingAverage: 0,
        reviewCount: 0,
        createdAt,
        updatedAt: createdAt,
      }),
    );
  }

  // ---- Sync category product arrays ----
  for (const category of [KURTI_TREE[0].parent, ...Object.values(created)]) {
    category.products = made
      .filter(
        (p) =>
          category._id.equals(p.categoryId) ||
          (p.categoryIds ?? []).some((id) => category._id.equals(id)),
      )
      .map((p) => p._id);
    await category.save();
  }

  console.log("Kurti seed complete:");
  console.log(`  parent:     Kurti (/${KURTI_TREE[0].parent.slug})`);
  for (const sub of Object.values(created)) {
    console.log(`  sub:        ${sub.name} (/${sub.slug}) — ${sub.products.length} products`);
  }
  console.log(`  products:   ${made.length} (no images, active)`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Kurti seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
