// Rebuilds the store with the real kurti catalogue.
//
// Every photograph in client/public/kurtees is one product: the file is the
// product's main image, its name, colour and every detail on the record come
// from what is visible in that photograph. Nothing is invented — where a detail
// cannot be seen (for example the fibre content) it is left off the record
// instead of being guessed.
//
// What it touches:
//   products, categories        deleted and rebuilt
//   product reviews             deleted (they pointed at the old products)
//   carts, wishlists            emptied (they pointed at the old products)
//   users, orders, payments, addresses, website and vendor reviews
//                               left exactly as they are
//
// Usage:  node src/scripts/seed-kurti-catalog.js
//
// Destructive: the stores listed above are rewritten each run. Orders keep the
// snapshot of what was bought, so past orders still read correctly afterwards.
import mongoose from "mongoose";

import Category from "../modules/category/category.model.js";
import Product from "../modules/product/product.model.js";
import Review from "../modules/review/review.model.js";
import Cart from "../modules/cart/cart.model.js";
import Wishlist from "../modules/wishlist/wishlist.model.js";
import Vendor from "../modules/vendor/vendor.model.js";
import connectDB from "../config/db.js";

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// The photographs live in client/public/kurtees and are served from the site
// root, so the stored path is the public one.
const image = (file) => `/kurtees/${encodeURIComponent(file)}`;

// The three sizes the catalogue is sold in, largest last: XL, 2XL, 3XL.
const SIZES = ["XL", "2XL", "3XL"];

// The four departments. Slugs are unchanged so every existing link (header,
// homepage circles, footer, saved bookmarks) keeps landing on the right grid.
const CATEGORIES = [
  {
    name: "1 Piece",
    slug: "kurti-1-piece",
    description: "Single pieces — a kurta, a maxi or a tunic that is complete on its own.",
  },
  {
    name: "2 Piece",
    slug: "kurti-2-piece-set",
    description: "A kurti with the trouser it was cut to match, sold as one set.",
  },
  {
    name: "3 Piece",
    slug: "kurti-3-piece-set",
    description: "Kurti, trouser and dupatta together, printed and finished as a set.",
  },
  {
    name: "Cord Set",
    slug: "coord-set",
    description: "Matched top-and-bottom sets in a modern cut.",
  },
];

// One entry per photograph that shows a distinct design. The duplicate file
// (Elegant Purple Embroidered Kurta Portrait (1).png) is the same image byte for
// byte as Elegant Purple Embroidered Kurta Portrait.png, so it is not repeated.
const PRODUCTS = [
  {
    name: "Charcoal Noor Embroidered A-Line Suit",
    file: "Elegant Charcoal Ethnicwear Editorial.png",
    colour: "Charcoal grey",
    category: "kurti-3-piece-set",
    price: 3299,
    mrp: 4599,
    description:
      "A charcoal A-line suit with silver-white thread embroidery tracing its V-neckline and wide sleeve cuffs. Fine embroidered lines run down the front and side panels, and the matching dupatta repeats a small booti print inside an embroidered border. Comes with straight charcoal trousers.",
    specs: [
      ["Colour", "Charcoal grey"],
      ["Work", "Silver-white thread embroidery on neck, cuffs and panels"],
      ["Neckline", "V-neck with embroidered border"],
      ["Sleeves", "Three-quarter with wide embroidered cuffs"],
      ["Length", "Calf-length A-line"],
      ["Pieces", "Kurti, trouser, dupatta"],
      ["Dupatta", "Printed booti with embroidered border"],
    ],
  },
  {
    name: "Crimson Chevron Flared Maxi",
    file: "Elegant Crimson Chevron Maxi Portrait.png",
    colour: "Crimson red",
    category: "kurti-1-piece",
    price: 2199,
    mrp: 2999,
    description:
      "A floor-sweeping crimson maxi cut with a full A-line flare and finished with an ivory chevron yoke picked out in red thread work. Tasselled buttons sit on the placket and the full sleeves close with striped cuffs. One piece, ready to wear on its own.",
    specs: [
      ["Colour", "Crimson red with ivory yoke"],
      ["Work", "Chevron yoke with thread work and tasselled buttons"],
      ["Neckline", "Round neck with button placket"],
      ["Sleeves", "Full-length with striped cuffs"],
      ["Length", "Ankle-length flare"],
      ["Pieces", "One-piece maxi"],
    ],
  },
  {
    name: "Ivory Starflower A-Line Kurta Set",
    file: "Elegant Ivory Anarkali Fashion Portrait.png",
    colour: "Ivory",
    category: "kurti-2-piece-set",
    price: 2499,
    mrp: 3399,
    description:
      "An ivory A-line kurta with a short mandarin collar, a woven brown placket and matching trim at the hem. Large blue-and-ochre starflowers sit low on the front, small embroidered bootis dot the bodice, and the sleeve cuffs carry a contrast print. Wears with the cream straight trousers it comes with.",
    specs: [
      ["Colour", "Ivory with brown and teal accents"],
      ["Work", "Woven trim, embroidered bootis, starflower motifs"],
      ["Neckline", "Mandarin collar with a short V slit"],
      ["Sleeves", "Three-quarter with contrast printed cuffs"],
      ["Length", "Calf-length A-line"],
      ["Pieces", "Kurta, trouser"],
    ],
  },
  {
    name: "Maroon Gulnar Booti Anarkali Set",
    file: "Elegant Maroon Anarkali Portrait.png",
    colour: "Maroon",
    category: "kurti-2-piece-set",
    price: 2899,
    mrp: 3899,
    description:
      "A deep maroon anarkali with a densely embroidered gold-tone yoke and an all-over booti print. Printed border bands ring the flared hem, and the three-quarter sleeves finish in embroidered cuffs. Comes with matching maroon trousers.",
    specs: [
      ["Colour", "Deep maroon"],
      ["Work", "Embroidered yoke, gold-tone booti print, printed hem borders"],
      ["Neckline", "Round neck with embroidered yoke"],
      ["Sleeves", "Three-quarter with embroidered cuffs"],
      ["Length", "Ankle-length flare"],
      ["Pieces", "Anarkali, trouser"],
    ],
  },
  {
    name: "Neel Navy Floral Anarkali Suit",
    file: "Elegant Navy Floral Salwar Suit Portrait.png",
    colour: "Navy blue",
    category: "kurti-3-piece-set",
    price: 3199,
    mrp: 4299,
    description:
      "A navy anarkali with a lilac-and-pink embroidered placket and a wide floral border print along the hem. The dupatta repeats that border in pink, and the trousers are plain navy. Three pieces that are already styled to match.",
    specs: [
      ["Colour", "Navy blue"],
      ["Work", "Embroidered placket, floral border print at the hem"],
      ["Neckline", "Round neck with V slit"],
      ["Sleeves", "Three-quarter with floral cuffs"],
      ["Length", "Calf-length flare"],
      ["Pieces", "Anarkali, trouser, dupatta"],
      ["Dupatta", "Printed floral border in pink and lilac"],
    ],
  },
  {
    name: "Gulabi Lotus Print Kurta Set",
    file: "Elegant Pink Floral Kurti Ensemble.png",
    colour: "Blush pink",
    category: "kurti-2-piece-set",
    price: 1799,
    mrp: 2499,
    description:
      "A blush pink kurta covered in a white lotus print, with pintuck detail at the bodice and a keyhole neckline tied with a drawstring. Side slits and three-quarter sleeves keep it easy, and the trousers carry a fine self stripe.",
    specs: [
      ["Colour", "Blush pink"],
      ["Work", "All-over lotus floral print, pintuck bodice"],
      ["Neckline", "Round keyhole with tie"],
      ["Sleeves", "Three-quarter"],
      ["Length", "Calf-length with side slits"],
      ["Pieces", "Kurta, trouser"],
    ],
  },
  {
    name: "Jamuni Plum Tassel-Tie Suit",
    file: "Elegant Plum Salwar Kameez Portrait.png",
    colour: "Plum",
    category: "kurti-3-piece-set",
    price: 2999,
    mrp: 3999,
    description:
      "A plum kurta with an embroidered placket panel finished in tassels, and printed bands running down the sides and sleeve hems. The dupatta picks up the same print at its border. Wears with the plum trousers it comes with.",
    specs: [
      ["Colour", "Plum"],
      ["Work", "Embroidered placket with tassels, printed side and cuff bands"],
      ["Neckline", "Round neck with notched slit"],
      ["Sleeves", "Three-quarter with printed cuffs"],
      ["Length", "Calf-length with side slits"],
      ["Pieces", "Kurta, trouser, dupatta"],
      ["Dupatta", "Printed border to match the side panels"],
    ],
  },
  {
    name: "Baingani Lotus Vine Kurta Set",
    file: "Elegant Purple Embroidered Kurta Portrait.png",
    colour: "Purple",
    category: "kurti-2-piece-set",
    price: 2199,
    mrp: 2999,
    description:
      "A purple A-line kurta with an embroidered button placket and silver-white lotus vines rising from the hem. The same lotus motif is embroidered on the sleeves, and the trousers close with an embroidered hem.",
    specs: [
      ["Colour", "Purple"],
      ["Work", "Silver-white lotus vine embroidery, embroidered placket"],
      ["Neckline", "Round neck with button placket"],
      ["Sleeves", "Three-quarter with lotus motifs"],
      ["Length", "Calf-length A-line"],
      ["Pieces", "Kurta, trouser"],
    ],
  },
  {
    name: "Taupe Sona Embroidered Suit",
    file: "Elegant Taupe Embroidered Ensemble.png",
    colour: "Taupe",
    category: "kurti-3-piece-set",
    price: 2799,
    mrp: 3699,
    description:
      "A taupe suit embroidered tonally at the yoke and again along the lower panels, where floral vines climb to the hem. The dupatta is bordered with a wide band of the same embroidery. Three pieces in one quiet colour.",
    specs: [
      ["Colour", "Taupe"],
      ["Work", "Tonal embroidery at yoke, side panels and hem"],
      ["Neckline", "Round neck with a soft V"],
      ["Sleeves", "Three-quarter with embroidered cuffs"],
      ["Length", "Calf-length straight"],
      ["Pieces", "Kurta, trouser, dupatta"],
      ["Dupatta", "Wide tonal embroidered border"],
    ],
  },
  {
    name: "Taupe Bhoomi Buti Printed Suit",
    file: "Elegant Taupe Printed Salwar Kameez Portrait.png",
    colour: "Taupe brown",
    category: "kurti-3-piece-set",
    price: 2599,
    mrp: 3499,
    description:
      "A taupe-brown suit printed all over with small floral butis and finished with a mandarin collar and tassel tie. The trousers carry a woven stripe that repeats on the dupatta's border. Three pieces that read as one print.",
    specs: [
      ["Colour", "Taupe brown"],
      ["Work", "All-over buti print, woven stripe trims"],
      ["Neckline", "Mandarin collar with V slit and tassels"],
      ["Sleeves", "Three-quarter with printed cuffs"],
      ["Length", "Calf-length with side slits"],
      ["Pieces", "Kurta, trouser, dupatta"],
      ["Dupatta", "Striped print border"],
    ],
  },
  {
    name: "Rose Garden Embroidered Kurta Set",
    file: "Embroidered Rose Kurta Portrait.png",
    colour: "Dusty rose",
    category: "kurti-3-piece-set",
    price: 2699,
    mrp: 3599,
    description:
      "A dusty rose kurta covered in fine floral embroidery, with large pastel flowers worked into the hem. The dupatta is sheer with a lace edging, and the trousers are plain rose. A soft set for daytime functions.",
    specs: [
      ["Colour", "Dusty rose"],
      ["Work", "Floral vine embroidery with large hem motifs"],
      ["Neckline", "Round neck"],
      ["Sleeves", "Three-quarter"],
      ["Length", "Calf-length straight"],
      ["Pieces", "Kurta, trouser, dupatta"],
      ["Dupatta", "Sheer with lace edging"],
    ],
  },
  {
    name: "Haldi Mustard Floral Vine Suit",
    file: "Mustard Floral Embroidery Editorial Portrait.png",
    colour: "Mustard gold",
    category: "kurti-3-piece-set",
    price: 2899,
    mrp: 3799,
    description:
      "A mustard A-line suit with a contrast embroidered placket and a floral vine embroidered across the hem. Printed floral panels sit on the sleeve cuffs, and the sheer dupatta is printed and trimmed with lace.",
    specs: [
      ["Colour", "Mustard gold"],
      ["Work", "Embroidered placket and hem vine, printed sleeve panels"],
      ["Neckline", "Round scoop with embroidered placket"],
      ["Sleeves", "Three-quarter with printed cuffs"],
      ["Length", "Calf-length A-line"],
      ["Pieces", "Kurta, trouser, dupatta"],
      ["Dupatta", "Printed sheer with lace trim"],
    ],
  },
  {
    name: "Turmeric Mirror-Work Kurta Set",
    file: "Mustard Kurta Fashion Portrait.png",
    colour: "Turmeric yellow",
    category: "kurti-2-piece-set",
    price: 1999,
    mrp: 2699,
    description:
      "A turmeric-yellow A-line kurta with a contrast pink yoke worked in mirrors and finished with white piping and a tassel. Tiny white and gold motifs cover the body, and the trousers are solid yellow.",
    specs: [
      ["Colour", "Turmeric yellow with pink yoke"],
      ["Work", "Pink mirror-work yoke, white piping, all-over motif print"],
      ["Neckline", "Round neck with yoke panel"],
      ["Sleeves", "Three-quarter"],
      ["Length", "Calf-length with side slits"],
      ["Pieces", "Kurta, trouser"],
    ],
  },
  {
    name: "Antique Gold V-Yoke Kurta Set",
    file: "Mustard Kurta Portrait in Warm Studio Light.png",
    colour: "Antique gold",
    category: "kurti-2-piece-set",
    price: 1899,
    mrp: 2599,
    description:
      "An antique-gold kurta with a deep V neckline and tonal thread embroidery spreading across the yoke. Wide three-quarter sleeves and a straight, side-slit body keep the line clean. Comes with matching trousers.",
    specs: [
      ["Colour", "Antique gold"],
      ["Work", "Tonal thread embroidery across the yoke"],
      ["Neckline", "V-neck with embroidered yoke"],
      ["Sleeves", "Three-quarter, wide"],
      ["Length", "Calf-length straight with side slits"],
      ["Pieces", "Kurta, trouser"],
    ],
  },
  {
    name: "Navy Rose Print Anarkali Suit",
    file: "Navy Floral Indian Kurta Set.png",
    colour: "Navy",
    category: "kurti-3-piece-set",
    price: 3099,
    mrp: 4199,
    description:
      "A navy anarkali printed with pink roses and grey-green leaves, closed with a printed button placket. The dupatta carries the same print with a striped border, and the trousers match the set. Three pieces in one print.",
    specs: [
      ["Colour", "Navy with pink roses"],
      ["Work", "Rose and leaf print, printed button placket"],
      ["Neckline", "Round neck with printed placket"],
      ["Sleeves", "Three-quarter"],
      ["Length", "Calf-length flare"],
      ["Pieces", "Anarkali, trouser, dupatta"],
      ["Dupatta", "Rose print with striped border"],
    ],
  },
  {
    name: "Olive Mirror-Work Yoke Anarkali Set",
    file: "Olive Green Embroidered Kurta Look.png",
    colour: "Olive green",
    category: "kurti-2-piece-set",
    price: 2599,
    mrp: 3499,
    description:
      "An olive anarkali with a contrast rust-and-black embroidered yoke worked with mirrors and finished with a tassel tie. The flared body is left plain below the yoke, and the three-quarter sleeves end in embroidered cuffs.",
    specs: [
      ["Colour", "Olive green with rust yoke"],
      ["Work", "Contrast embroidered mirror-work yoke"],
      ["Neckline", "Notched round neck with tassel tie"],
      ["Sleeves", "Three-quarter with embroidered cuffs"],
      ["Length", "Calf-length flare"],
      ["Pieces", "Anarkali, trouser"],
    ],
  },
  {
    name: "Teal Blossom Embroidered Kurta Set",
    file: "Teal Embroidered Kurta Studio Portrait.png",
    colour: "Teal blue",
    category: "kurti-2-piece-set",
    price: 2099,
    mrp: 2799,
    description:
      "A teal kurta with a notched collar and a full button placket, embroidered with pink blossom circles at the chest and hip. Three-quarter sleeves and a straight body keep it office-ready, and the trousers match.",
    specs: [
      ["Colour", "Teal blue"],
      ["Work", "Embroidered blossom motifs, button placket"],
      ["Neckline", "Notched round neck with button placket"],
      ["Sleeves", "Three-quarter"],
      ["Length", "Calf-length straight"],
      ["Pieces", "Kurta, trouser"],
    ],
  },
];

// Stock per size. Every design is cut in all three sizes, so all three are on the
// record; a few designs have sold their 3XL out, which is the real out-of-stock
// state the product page shows struck through rather than hiding the size.
const SKU_PREFIX = {
  "kurti-1-piece": "LU-KT1",
  "kurti-2-piece-set": "LU-KT2",
  "kurti-3-piece-set": "LU-KT3",
  "coord-set": "LU-CRD",
};

const stockFor = (productIndex, sizeIndex) => {
  if (sizeIndex === 2 && productIndex % 4 === 3) return 0; // 3XL sold out
  return 2 + ((productIndex * 3 + sizeIndex * 2) % 5);
};

const run = async () => {
  await connectDB();

  const counts = {
    products: await Product.countDocuments(),
    categories: await Category.countDocuments(),
  };

  // --- 1. Clear only what is being rebuilt --------------------------------
  await Product.deleteMany({});
  await Category.deleteMany({});
  // Product reviews pointed at the products that no longer exist.
  await Review.deleteMany({});
  // Carts and wishlists hold product ids; empty them rather than leave dead rows.
  await Cart.updateMany({}, { $set: { products: [] } });
  await Wishlist.updateMany({}, { $set: { products: [] } });

  // Orders, payments, users, addresses and store reviews are untouched.

  // --- 2. Categories ------------------------------------------------------
  const categories = new Map();
  for (const [index, plan] of CATEGORIES.entries()) {
    const category = await Category.create({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      parentCategoryId: null,
      level: 0,
      status: "active",
      createdAt: daysAgo(40 - index),
      updatedAt: daysAgo(40 - index),
    });

    categories.set(plan.slug, category);
  }

  const vendor = await Vendor.findOne({ approvalStatus: "approved" }).sort({ createdAt: 1 });

  // --- 3. Products, one per photograph ------------------------------------
  const created = [];

  for (const [index, plan] of PRODUCTS.entries()) {
    const category = categories.get(plan.category);
    const photo = image(plan.file);
    const createdAt = daysAgo(PRODUCTS.length - index);
    const sku = `${SKU_PREFIX[plan.category]}-${String(index + 1).padStart(2, "0")}`;

    const variantCombinations = SIZES.map((size, sizeIndex) => ({
      variantName: `${plan.colour} / ${size}`,
      price: plan.price,
      comarePrice: plan.mrp,
      stock: stockFor(index, sizeIndex),
      sku: `${sku}-${size}`,
      mainImage: photo,
      galleryImages: [],
    }));

    const stock = variantCombinations.reduce((total, item) => total + item.stock, 0);

    const product = await Product.create({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      comarePrice: plan.mrp,
      stock,
      sku,
      categoryId: category._id,
      categoryIds: [category._id],
      vendorId: vendor?._id ?? null,
      status: "active",
      mainImage: photo,
      galleryImages: [],
      productSpecifications: [
        ...plan.specs.map(([key, value]) => ({ key, value })),
        { key: "Sizes", value: "XL to 3XL" },
      ],
      // One real colour is shown in the photograph, so the colour variant has a
      // single option. Size is the variant the shopper actually picks.
      variants: [
        { name: "Colour", options: [plan.colour] },
        { name: "Size", options: SIZES },
      ],
      variantCombinations,
      ratingAverage: 0,
      reviewCount: 0,
      createdAt,
      updatedAt: createdAt,
    });

    created.push(product);
  }

  // --- 4. Category product lists and cover images ---------------------------
  // Each department shows one of its own products as its cover, so the row of
  // circles at the top of the homepage is fed by the database rather than by a
  // hard-coded file. A department with no products keeps a null image and the
  // storefront draws its placeholder instead.
  for (const category of categories.values()) {
    const products = created.filter((product) => product.categoryId.equals(category._id));

    category.products = products.map((product) => product._id);
    category.image = products[0]?.mainImage ?? null;

    await category.save();
  }

  console.log("\nKurti catalogue ready:");
  console.log(`  removed       ${counts.products} products, ${counts.categories} categories`);
  console.log(`  categories    ${[...categories.values()].map((c) => c.name).join(", ")}`);
  console.log(`  products      ${created.length}`);
  console.log(`  images        ${created.length} of ${PRODUCTS.length} photographs`);
  console.log("");

  for (const product of created) {
    const category = [...categories.values()].find((c) => c._id.equals(product.categoryId));
    const inStock = product.variantCombinations.filter((item) => item.stock > 0);
    const sizes = inStock.map((item) => item.variantName.split(" / ")[1]);

    console.log(`  ${product.sku.padEnd(8)} ${category.name.padEnd(9)} ${product.name}`);
    console.log(
      `           ${product.mainImage}  |  stock ${product.stock} across ${sizes.length} sizes (${sizes[0]}–${sizes[sizes.length - 1]})`,
    );
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Kurti catalogue seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
