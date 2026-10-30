// Rebuilds the store with the old placeholder demo catalog.
//
// Superseded for catalogue work by seed-kurti-catalog.js, which builds the real
// kurti catalogue from client/public/kurtees and leaves customers and orders
// alone. This script still wipes every collection below, users included, so run
// it only when the whole demo dataset is meant to be rebuilt.
//
// Step 1 wipes every collection the storefront and dashboards read, so nothing
// from the old data is left behind. Step 2 creates one admin, one vendor, four
// demo customers, four women's categories (kurti 1 / 2 / 3 piece and co-ord
// sets), twelve products on the shared placeholder photo, delivered orders and approved reviews —
// the homepage review band needs approved website reviews, and product rows need
// a rating, which is recalculated from the approved product reviews.
//
// Usage:  node src/scripts/seed-fresh-catalog.js
//
// Destructive: everything in the collections listed below is deleted first.
// Re-running it rebuilds the same catalog from scratch.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../modules/user/user.model.js";
import UserOTP from "../modules/user/user.otp.model.js";
import Vendor from "../modules/vendor/vendor.model.js";
import Category from "../modules/category/category.model.js";
import Product from "../modules/product/product.model.js";
import Order from "../modules/order/order.model.js";
import Payment from "../modules/payment/payment.model.js";
import Cart from "../modules/cart/cart.model.js";
import Wishlist from "../modules/wishlist/wishlist.model.js";
import Address from "../modules/address/address.model.js";
import Review from "../modules/review/review.model.js";
import WebsiteReview from "../modules/websiteReview/websiteReview.model.js";
import VendorReview from "../modules/vendorReview/vendorReview.model.js";
import connectDB from "../config/db.js";

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const round2 = (n) => Math.round(n * 100) / 100;

// --- 1. What gets wiped, in an order that respects the references ------------
const WIPE = [
  ["payments", Payment],
  ["orders", Order],
  ["carts", Cart],
  ["wishlists", Wishlist],
  ["addresses", Address],
  ["product reviews", Review],
  ["website reviews", WebsiteReview],
  ["vendor reviews", VendorReview],
  ["products", Product],
  ["categories", Category],
  ["vendors", Vendor],
  ["users", User],
  ["otp codes", UserOTP],
];

// --- 2. Categories: kurtis in three piece counts, plus co-ord sets ----------
const CATEGORIES = [
  {
    name: "Kurti 1 Piece",
    slug: "kurti-1-piece",
    description: "Single kurtis you can style your own way.",
  },
  {
    name: "Kurti 2 Piece Set",
    slug: "kurti-2-piece-set",
    description: "A kurti with its matching bottom, sold as one set.",
  },
  {
    name: "Kurti 3 Piece Set",
    slug: "kurti-3-piece-set",
    description: "Kurti, bottom and dupatta in one coordinated set.",
  },
  {
    name: "Co-ord Set",
    slug: "coord-set",
    description: "Matching top and bottom sets with a modern cut.",
  },
];

// Twelve products, three per category. Every product points at the one
// placeholder the client serves from /public/images, until real photography is
// uploaded through the admin product form.
const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

const PRODUCTS = [
  {
    sku: "KT1-01",
    name: "Floral Print Cotton Kurti",
    price: 799,
    comarePrice: 1299,
    stock: 32,
    category: "kurti-1-piece",
    description:
      "A soft cotton kurti in a hand-block floral print. Straight cut, side slits and three-quarter sleeves make it an easy everyday piece.",
    specs: [
      ["Material", "100% cotton"],
      ["Length", "Calf length"],
      ["Sleeve", "Three-quarter"],
      ["Care", "Machine wash cold"],
    ],
  },
  {
    sku: "KT1-02",
    name: "Indigo Print Kurti",
    price: 799,
    comarePrice: 1299,
    stock: 28,
    category: "kurti-1-piece",
    description:
      "Indigo block print on a relaxed A-line kurti, finished with a mandarin collar and wooden buttons on the placket.",
    specs: [
      ["Material", "Cotton cambric"],
      ["Fit", "A-line"],
      ["Collar", "Mandarin"],
      ["Care", "Hand wash separately"],
    ],
  },
  {
    sku: "KT1-03",
    name: "Chikankari Straight Kurti",
    price: 1299,
    comarePrice: 0,
    stock: 18,
    category: "kurti-1-piece",
    description:
      "All-over chikankari-style embroidery on a lightweight straight kurti. Looks dressed up with a dupatta, easy on its own.",
    specs: [
      ["Material", "Cotton blend"],
      ["Embroidery", "Chikankari style"],
      ["Length", "Knee"],
      ["Care", "Hand wash"],
    ],
  },
  {
    sku: "KT2-04",
    name: "Kurti With Palazzo Set",
    price: 1899,
    comarePrice: 2399,
    stock: 20,
    category: "kurti-2-piece-set",
    description:
      "A printed straight kurti with matching flared palazzos. Same fabric top and bottom, so it looks put together with no effort.",
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
    category: "kurti-2-piece-set",
    description:
      "A solid straight kurti with tapered pants and a printed trim on the sleeves. Office-friendly and comfortable through the day.",
    specs: [
      ["Pieces", "Kurti + pant"],
      ["Material", "Cotton flex"],
      ["Fit", "Straight"],
      ["Care", "Machine wash"],
    ],
  },
  {
    sku: "KT2-06",
    name: "Rayon Printed Kurti Set",
    price: 899,
    comarePrice: 1499,
    stock: 26,
    category: "kurti-2-piece-set",
    description:
      "A breezy rayon kurti with a matching printed dupatta-style stole and straight pants. Light enough for summer weddings.",
    specs: [
      ["Pieces", "Kurti + pant"],
      ["Material", "Rayon"],
      ["Occasion", "Day wear"],
      ["Care", "Machine wash"],
    ],
  },
  {
    sku: "KT3-07",
    name: "Designer Kurti With Dupatta",
    price: 1299,
    comarePrice: 1999,
    stock: 16,
    category: "kurti-3-piece-set",
    description:
      "A printed kurti with pants and a sheer dupatta finished with a lace edge. The complete set for festive mornings.",
    specs: [
      ["Pieces", "Kurti + pant + dupatta"],
      ["Material", "Cotton silk"],
      ["Dupatta", "Sheer with lace edge"],
      ["Care", "Dry clean"],
    ],
  },
  {
    sku: "KT3-08",
    name: "Festive Kurti Sharara Set",
    price: 2799,
    comarePrice: 3799,
    stock: 10,
    category: "kurti-3-piece-set",
    description:
      "A short flared kurti over sharara pants with a net dupatta and gota detailing. Made for mehendi mornings and festive evenings.",
    specs: [
      ["Pieces", "Kurti + sharara + dupatta"],
      ["Detail", "Gota trim"],
      ["Occasion", "Festive"],
      ["Care", "Dry clean"],
    ],
  },
  {
    sku: "KT3-09",
    name: "Chanderi Kurti Suit Set",
    price: 2499,
    comarePrice: 3299,
    stock: 12,
    category: "kurti-3-piece-set",
    description:
      "Chanderi silk kurti with matching pants and a zari-striped dupatta. Light on the shoulder with a quiet sheen.",
    specs: [
      ["Pieces", "Kurti + pant + dupatta"],
      ["Material", "Chanderi silk"],
      ["Dupatta", "Zari stripe"],
      ["Care", "Dry clean"],
    ],
  },
  {
    sku: "CRD-10",
    name: "Linen Co-ord Set",
    price: 2199,
    comarePrice: 2899,
    stock: 15,
    category: "coord-set",
    description:
      "A relaxed shirt and wide-leg trouser in washed linen. Wear it together, or split the two across the week.",
    specs: [
      ["Pieces", "Shirt + trouser"],
      ["Material", "100% linen"],
      ["Fit", "Relaxed"],
      ["Care", "Machine wash cold"],
    ],
  },
  {
    sku: "CRD-11",
    name: "Printed Cotton Co-ord",
    price: 1799,
    comarePrice: 2499,
    stock: 19,
    category: "coord-set",
    description:
      "A cropped top and matching midi skirt in a summer print. Elasticated waist keeps it easy all day long.",
    specs: [
      ["Pieces", "Top + skirt"],
      ["Material", "Cotton poplin"],
      ["Waist", "Elasticated"],
      ["Care", "Machine wash"],
    ],
  },
  {
    sku: "CRD-12",
    name: "Knit Lounge Co-ord",
    price: 1599,
    comarePrice: 0,
    stock: 26,
    category: "coord-set",
    description:
      "A soft knit tee and drawstring pants for slow days at home. Ribbed trims and a relaxed loungewear fit.",
    specs: [
      ["Pieces", "Tee + pants"],
      ["Material", "Ribbed knit blend"],
      ["Waist", "Drawstring"],
      ["Care", "Machine wash"],
    ],
  },
];

// --- 3. People --------------------------------------------------------------
const ADMIN = {
  firstName: "Lunella",
  lastName: "Admin",
  email: "admin@lunella.test",
  phone: "9800000001",
  password: "Admin@1234",
  role: "admin",
  gender: "female",
};

const VENDOR_USER = {
  firstName: "Meera",
  lastName: "Deshmukh",
  email: "studio@lunella.test",
  phone: "9800000002",
  password: "Vendor@1234",
  role: "vendor",
  gender: "female",
};

// Four customers, all women: they write the approved reviews the storefront shows.
const CUSTOMERS = [
  { firstName: "Priya", lastName: "Sharma", email: "priya@lunella.test", phone: "9800000003" },
  { firstName: "Neha", lastName: "Patel", email: "neha@lunella.test", phone: "9800000004" },
  { firstName: "Aarti", lastName: "Mehta", email: "aarti@lunella.test", phone: "9800000005" },
  { firstName: "Riya", lastName: "Kapoor", email: "riya@lunella.test", phone: "9800000006" },
];
const CUSTOMER_PASSWORD = "Customer@1234";

// --- 4. Reviews ------------------------------------------------------------
// Website reviews appear in the homepage band; only one per account is allowed.
const WEBSITE_REVIEWS = [
  {
    customer: 0,
    rating: 5,
    title: "Beautiful collection and fast delivery",
    comment:
      "The fabric feels lovely and the colours are exactly like the photos. My order reached me in three days.",
  },
  {
    customer: 1,
    rating: 5,
    title: "Kurtis are so elegant and comfortable",
    comment:
      "I wore the co-ord set to a family lunch and got so many compliments. Fits true to size and does not need ironing.",
  },
  {
    customer: 2,
    rating: 4,
    title: "Great quality for the price",
    comment:
      "Stitching is neat and the cotton is soft. Only wish there were more colours in my size.",
  },
  {
    customer: 3,
    rating: 5,
    title: "My new favourite store",
    comment:
      "Ordered twice already. The dupatta sets are worth it and the size guide was spot on.",
  },
];

// One row per (customer, product). Ratings and copy are the store's own demo
// content, marked as verified purchases because an order for each one is seeded.
const PRODUCT_REVIEWS = [
  {
    customer: 0,
    sku: "KT1-01",
    rating: 5,
    title: "Perfect everyday kurti",
    comment: "Soft cotton, no see-through and the print has not faded after three washes.",
  },
  {
    customer: 1,
    sku: "KT1-01",
    rating: 4,
    title: "Lovely fit",
    comment: "True to size and comfortable for a full day of work. Sleeves are a good length.",
  },
  {
    customer: 2,
    sku: "KT1-02",
    rating: 5,
    title: "The indigo print is stunning",
    comment: "The collar and buttons make it look far more expensive than it is.",
  },
  {
    customer: 0,
    sku: "KT1-03",
    rating: 4,
    title: "Elegant embroidery",
    comment: "Delicate work, very light to wear. I keep it for evenings with a dupatta.",
  },
  {
    customer: 3,
    sku: "KT2-04",
    rating: 5,
    title: "Set looks so put together",
    comment: "The palazzos fall beautifully and the kurti does not cling. Great for functions.",
  },
  {
    customer: 1,
    sku: "KT2-05",
    rating: 4,
    title: "My office staple",
    comment: "The pant has pockets, which sold me. Fabric has a little stretch and stays crisp.",
  },
  {
    customer: 2,
    sku: "KT2-06",
    rating: 5,
    title: "So light for summer",
    comment: "Breezy rayon and the stole finishes the look. Washed well on a gentle cycle.",
  },
  {
    customer: 0,
    sku: "KT3-07",
    rating: 5,
    title: "Complete set, no searching",
    comment: "Everything matched, including the lace on the dupatta. Saved me so much time.",
  },
  {
    customer: 3,
    sku: "KT3-08",
    rating: 5,
    title: "Wore it for my sister's mehendi",
    comment: "The gota detailing is neat and the sharara is comfortable to sit in for hours.",
  },
  {
    customer: 1,
    sku: "KT3-09",
    rating: 4,
    title: "Quiet luxury",
    comment: "The chanderi has a soft sheen and is not heavy at all. Dry clean only, as described.",
  },
  {
    customer: 2,
    sku: "CRD-10",
    rating: 5,
    title: "Linen that actually breathes",
    comment: "Perfect for Pune summers. Slightly relaxed through the leg, exactly what I wanted.",
  },
  {
    customer: 0,
    sku: "CRD-11",
    rating: 4,
    title: "Cute summer co-ord",
    comment: "The skirt sits well on the waist and the print is cheerful. Size up if between sizes.",
  },
  {
    customer: 3,
    sku: "CRD-12",
    rating: 5,
    title: "Softest loungewear",
    comment: "I live in this at home now. The drawstring is sturdy and the knit does not pill.",
  },
];

const VENDOR_REVIEWS = [
  {
    customer: 0,
    rating: 5,
    title: "Careful packing",
    comment: "Each piece arrived folded with tissue and no creases. Clearly packed by hand.",
  },
  {
    customer: 2,
    rating: 5,
    title: "Helpful with sizing",
    comment: "I messaged about the fit and got a reply the same day. The recommendation was right.",
  },
];

const run = async () => {
  await connectDB();

  // ---- 1. Wipe ------------------------------------------------------------
  for (const [label, model] of WIPE) {
    const { deletedCount } = await model.deleteMany({});
    if (deletedCount) console.log(`  cleared ${deletedCount} ${label}`);
  }

  // ---- 2. People ----------------------------------------------------------
  const hash = (password) => bcrypt.hash(password, 10);

  const admin = await User.create({
    ...ADMIN,
    password: await hash(ADMIN.password),
    emailVerified: true,
    status: "active",
  });

  const vendorUser = await User.create({
    ...VENDOR_USER,
    password: await hash(VENDOR_USER.password),
    emailVerified: true,
    status: "active",
  });

  const vendor = await Vendor.create({
    userId: vendorUser._id,
    storeName: "Lunella Studio",
    storeDescription:
      "Our own studio label: block-printed kurtis, coordinated sets and dupattas, cut and finished in small batches.",
    storeAddress: "18 Linen Lane, Camp, Pune, Maharashtra 411001",
    storeContact: VENDOR_USER.phone,
    storeEmail: VENDOR_USER.email,
    approvalStatus: "approved",
    status: "active",
    storeSocial: {
      instagram: null,
      facebook: null,
      youtube: null,
      twitter: null,
      website: null,
    },
  });

  const customers = [];
  for (const person of CUSTOMERS) {
    customers.push(
      await User.create({
        ...person,
        password: await hash(CUSTOMER_PASSWORD),
        role: "customer",
        gender: "female",
        emailVerified: true,
        status: "active",
      }),
    );
  }

  // ---- 3. Categories and products ----------------------------------------
  const categories = {};
  for (const [index, plan] of CATEGORIES.entries()) {
    categories[plan.slug] = await Category.create({
      name: plan.name,
      description: plan.description,
      slug: plan.slug,
      parentCategoryId: null,
      level: 0,
      status: "active",
      createdAt: daysAgo(30 - index),
      updatedAt: daysAgo(30 - index),
    });
  }

  const products = [];
  for (const [index, plan] of PRODUCTS.entries()) {
    const category = categories[plan.category];
    const mainImage = PLACEHOLDER_IMAGE;
    // No extra shots: the detail page shows the placeholder alone.
    const galleryImages = [];
    const createdAt = daysAgo(2 + index * 2);

    products.push(
      await Product.create({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        comarePrice: plan.comarePrice || undefined,
        stock: plan.stock,
        sku: plan.sku,
        categoryId: category._id,
        categoryIds: [category._id],
        vendorId: vendor._id,
        status: "active",
        mainImage,
        galleryImages,
        productSpecifications: plan.specs.map(([key, value]) => ({ key, value })),
        ratingAverage: 0,
        reviewCount: 0,
        createdAt,
        updatedAt: createdAt,
      }),
    );
  }

  const productBySku = new Map(products.map((product) => [product.sku, product]));

  // ---- 4. Delivered orders (these are what make a review verified) --------
  for (const [index, plan] of PRODUCT_REVIEWS.entries()) {
    const customer = customers[plan.customer];
    const product = productBySku.get(plan.sku);
    const placedAt = daysAgo(20 - Math.floor(index / 2));
    const shipping = product.price >= 999 ? 0 : 79;
    const total = round2(product.price + shipping);

    await Order.create({
      userId: customer._id,
      items: [
        {
          productId: product._id,
          vendorId: vendor._id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.price,
          quantity: 1,
          lineTotal: product.price,
        },
      ],
      shippingAddress: {
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        addressLine1: `${12 + index} MG Road`,
        addressLine2: null,
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411001",
        country: "India",
      },
      subtotalAmount: product.price,
      discountAmount: 0,
      taxAmount: 0,
      shippingAmount: shipping,
      totalAmount: total,
      orderStatus: "delivered",
      paymentStatus: "paid",
      placedAt,
      deliveredAt: new Date(placedAt.getTime() + 4 * 86400000),
      createdAt: placedAt,
      updatedAt: placedAt,
    });
  }

  // ---- 5. Reviews --------------------------------------------------------
  for (const review of WEBSITE_REVIEWS) {
    await WebsiteReview.create({
      userId: customers[review.customer]._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: "approved",
    });
  }

  for (const review of PRODUCT_REVIEWS) {
    const product = productBySku.get(review.sku);

    await Review.create({
      userId: customers[review.customer]._id,
      productId: product._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: "approved",
      verifiedPurchase: true,
    });
  }

  for (const review of VENDOR_REVIEWS) {
    await VendorReview.create({
      userId: customers[review.customer]._id,
      vendorId: vendor._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: "approved",
      verifiedPurchase: true,
    });
  }

  // ---- 6. Product ratings, recalculated like review.service.js does -------
  for (const product of products) {
    const approved = await Review.find({ productId: product._id, status: "approved" });
    const average =
      approved.length > 0
        ? approved.reduce((total, review) => total + review.rating, 0) / approved.length
        : 0;

    await Product.findByIdAndUpdate(product._id, {
      $set: {
        ratingAverage: Math.round(average * 100) / 100,
        reviewCount: approved.length,
      },
    });
  }

  // ---- 7. Category product lists ----------------------------------------
  for (const category of Object.values(categories)) {
    category.products = products
      .filter((product) => product.categoryId.equals(category._id))
      .map((product) => product._id);
    await category.save();
  }

  const ratings = await Product.find({ reviewCount: { $gt: 0 } }).select("name ratingAverage reviewCount");

  console.log("\nFresh catalog ready:");
  console.log(`  admin         ${admin.email} / ${ADMIN.password}`);
  console.log(`  vendor        ${vendorUser.email} / ${VENDOR_USER.password} (${vendor.storeName})`);
  console.log(`  customers     ${customers.map((user) => user.email).join(", ")} / ${CUSTOMER_PASSWORD}`);
  console.log(`  categories    ${Object.values(categories).map((c) => `${c.name} (/${c.slug})`).join(", ")}`);
  console.log(`  products      ${products.length} (placeholder photo)`);
  console.log(`  website reviews ${WEBSITE_REVIEWS.length} approved (homepage band)`);
  console.log(`  vendor reviews  ${VENDOR_REVIEWS.length} approved`);
  console.log(`  product reviews ${PRODUCT_REVIEWS.length} approved`);
  ratings.forEach((product) =>
    console.log(`    ${product.name}: ${product.ratingAverage} ★ from ${product.reviewCount}`),
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Fresh catalog seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
