// Seeds realistic demo data into the REAL database using the server's own
// models: categories, customers (hashed passwords), approved vendors, products
// with every field filled (NO images, as requested), and orders placed across
// different dates so the admin chart has something real to plot.
//
// Usage:  node src/scripts/seed-demo-data.js
// Safe to re-run: existing seed records are looked up by email/slug before
// creating, so nothing is duplicated.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../modules/user/user.model.js";
import Vendor from "../modules/vendor/vendor.model.js";
import Category from "../modules/category/category.model.js";
import Product from "../modules/product/product.model.js";
import Order from "../modules/order/order.model.js";
import connectDB from "../config/db.js";

const round2 = (n) => Math.round(n * 100) / 100;
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function upsertUser({ firstName, lastName, email, phone, password, role, gender }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const hashed = await bcrypt.hash(password, 10);
  return User.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashed,
    role,
    gender,
    emailVerified: true,
    tokenVersion: 0,
  });
}

async function upsertVendor({ user, storeName, storeDescription, storeAddress, contact, email }) {
  const existing = await Vendor.findOne({ userId: user._id });
  if (existing) return existing;

  return Vendor.create({
    userId: user._id,
    storeName,
    storeDescription,
    storeAddress,
    storeContact: contact,
    storeEmail: email,
    approvalStatus: "approved",
    status: "active",
    storeSocial: { instagram: null, facebook: null, youtube: null, twitter: null, website: null },
  });
}

async function upsertCategory({ name, description, slug }) {
  const existing = await Category.findOne({ slug });
  if (existing) return existing;
  return Category.create({
    name,
    description,
    slug,
    parentCategoryId: null,
    level: 0,
    status: "active",
  });
}

async function upsertProduct({ category, vendor, extraCategory = null, data, index }) {
  const existing = await Product.findOne({ sku: data.sku });
  if (existing) return existing;

  // Products created over the last ~8 weeks so "newest" sorting and the
  // homepage rows have a natural spread.
  const createdAt = daysAgo(3 + index * 4);

  return Product.create({
    name: data.name,
    description: data.description,
    price: data.price,
    comarePrice: data.comarePrice,
    stock: data.stock,
    sku: data.sku,
    categoryId: category._id,
    categoryIds: extraCategory ? [category._id, extraCategory._id] : [category._id],
    vendorId: vendor?._id ?? null,
    status: "active",
    productSpecifications: data.specs.map(([key, value]) => ({ key, value })),
    ratingAverage: 0,
    reviewCount: 0,
    createdAt,
    updatedAt: createdAt,
  });
}

// Orders are spread over the last 60 days with a mix of statuses and payment
// states, so the admin chart and totals have realistic variation.
const ORDER_PLAN = [
  { daysAgoN: 58, item: 0, customer: 0, status: "delivered", payment: "paid" },
  { daysAgoN: 55, item: 2, customer: 1, status: "delivered", payment: "paid" },
  { daysAgoN: 51, item: 4, customer: 2, status: "cancelled", payment: "failed" },
  { daysAgoN: 47, item: 1, customer: 3, status: "delivered", payment: "paid" },
  { daysAgoN: 43, item: 3, customer: 0, status: "returned", payment: "refunded" },
  { daysAgoN: 39, item: 5, customer: 1, status: "delivered", payment: "paid" },
  { daysAgoN: 35, item: 0, customer: 2, status: "delivered", payment: "paid" },
  { daysAgoN: 31, item: 2, customer: 3, status: "shipped", payment: "paid" },
  { daysAgoN: 27, item: 4, customer: 0, status: "delivered", payment: "paid" },
  { daysAgoN: 24, item: 1, customer: 1, status: "cancelled", payment: "refunded" },
  { daysAgoN: 20, item: 3, customer: 2, status: "processing", payment: "paid" },
  { daysAgoN: 17, item: 5, customer: 3, status: "delivered", payment: "paid" },
  { daysAgoN: 14, item: 0, customer: 0, status: "delivered", payment: "paid" },
  { daysAgoN: 11, item: 2, customer: 1, status: "shipped", payment: "paid" },
  { daysAgoN: 8, item: 4, customer: 2, status: "confirmed", payment: "paid" },
  { daysAgoN: 6, item: 1, customer: 3, status: "pending", payment: "unpaid" },
  { daysAgoN: 4, item: 3, customer: 0, status: "processing", payment: "paid" },
  { daysAgoN: 3, item: 5, customer: 1, status: "confirmed", payment: "paid" },
  { daysAgoN: 2, item: 0, customer: 2, status: "pending", payment: "pending" },
  { daysAgoN: 1, item: 2, customer: 3, status: "pending", payment: "unpaid" },
];

async function createOrder({ products, customers, plan, index }) {
  const product = products[plan.item];
  const customer = customers[plan.customer];

  const quantity = 1 + (index % 3);
  const lineTotal = round2(product.price * quantity);
  const shipping = lineTotal >= 999 ? 0 : 79;
  const tax = 0;
  const total = round2(lineTotal + shipping + tax);

  const placedAt = daysAgo(plan.daysAgoN);

  return Order.create({
    userId: customer._id,
    items: [
      {
        productId: product._id,
        vendorId: product.vendorId ?? null,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity,
        lineTotal,
      },
    ],
    shippingAddress: {
      fullName: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone,
      addressLine1: `${10 + index}MG Road`,
      addressLine2: null,
      city: "Pune",
      state: "Maharashtra",
      postalCode: "411001",
      country: "India",
    },
    subtotalAmount: lineTotal,
    discountAmount: 0,
    taxAmount: tax,
    shippingAmount: shipping,
    totalAmount: total,
    orderStatus: plan.status,
    paymentStatus: plan.payment,
    placedAt,
    createdAt: placedAt,
    updatedAt: placedAt,
    deliveredAt: plan.status === "delivered" ? new Date(placedAt.getTime() + 5 * 86400000) : null,
    cancelledAt: plan.status === "cancelled" ? new Date(placedAt.getTime() + 86400000) : null,
  });
}

const run = async () => {
  await connectDB();

  // ---- Categories (your two existing ones keep their slugs) ----
  const women = await upsertCategory({
    name: "Women",
    description: "Everyday and occasion wear for women.",
    slug: "women",
  });
  const men = await upsertCategory({
    name: "Men",
    description: "Everyday and occasion wear for men.",
    slug: "men",
  });
  const accessories = await upsertCategory({
    name: "Accessories",
    description: "Bags, scarves and finishing touches.",
    slug: "accessories",
  });
  const sale = await upsertCategory({
    name: "Sale",
    description: "Reduced prices on last-season favourites.",
    slug: "sale",
  });

  // ---- Customers ----
  const customers = [];
  for (const person of [
    {
      firstName: "Aarav",
      lastName: "Sharma",
      email: "aarav.demo@rynova.test",
      phone: "9820011001",
      password: "Demo@1234",
      gender: "male",
    },
    {
      firstName: "Ishita",
      lastName: "Patel",
      email: "ishita.demo@rynova.test",
      phone: "9820011002",
      password: "Demo@1234",
      gender: "female",
    },
    {
      firstName: "Rohan",
      lastName: "Mehta",
      email: "rohan.demo@rynova.test",
      phone: "9820011003",
      password: "Demo@1234",
      gender: "male",
    },
    {
      firstName: "Sanya",
      lastName: "Kapoor",
      email: "sanya.demo@rynova.test",
      phone: "9820011004",
      password: "Demo@1234",
      gender: "female",
    },
  ]) {
    customers.push(await upsertUser({ ...person, role: "customer" }));
  }

  // ---- Vendors (approved and active, so their products can publish) ----
  const vendorUser1 = await upsertUser({
    firstName: "Meera",
    lastName: "Deshmukh",
    email: "meera.store@rynova.test",
    phone: "9820022001",
    password: "Vendor@1234",
    role: "vendor",
    gender: "female",
  });
  const vendorUser2 = await upsertUser({
    firstName: "Karan",
    lastName: "Rao",
    email: "karan.store@rynova.test",
    phone: "9820022002",
    password: "Vendor@1234",
    role: "vendor",
    gender: "male",
  });

  const vendor1 = await upsertVendor({
    user: vendorUser1,
    storeName: "Loom & Lane",
    storeDescription:
      "Hand-picked slow fashion from independent studios — linen, cotton and everyday knits.",
    storeAddress: "12 Fabric Lane, Camp, Pune, Maharashtra 411001",
    contact: "9820022001",
    email: "meera.store@rynova.test",
  });
  const vendor2 = await upsertVendor({
    user: vendorUser2,
    storeName: "Northwind Supplies",
    storeDescription:
      "Durable everyday essentials — denim, outerwear and accessories built to last.",
    storeAddress: "44 Industrial Road, Baner, Pune, Maharashtra 411045",
    contact: "9820022002",
    email: "karan.store@rynova.test",
  });

  // ---- Products: every field filled, no images. Some belong to two
  //      categories (e.g. Women + Sale) to exercise the multi-category work. ----
  const PRODUCT_PLAN = [
    // Women
    {
      sku: "RWJ-01",
      name: "Warm Wrap Jumpsuit",
      price: 1299,
      comarePrice: 1699,
      stock: 24,
      description:
        "A lightweight wrap jumpsuit for all-day comfort — elasticated waist, drop armholes and a side zip. Machine washable and easy to dress up or down.",
      specs: [
        ["Material", "55% linen, 45% viscose"],
        ["Fit", "Relaxed"],
        ["Care", "Machine wash cold"],
      ],
    },
    {
      sku: "FLD-02",
      name: "Floral Day Dress",
      price: 1799,
      comarePrice: 2299,
      stock: 18,
      description:
        "A breezy midi dress in a soft floral print. Breathable cotton voile with a smocked bodice and folder pockets.",
      specs: [
        ["Material", "100% cotton voile"],
        ["Length", "Midi"],
        ["Care", "Gentle machine wash"],
      ],
    },
    {
      sku: "WKT-03",
      name: "Cloud Knit Sweater",
      price: 1499,
      comarePrice: 0,
      stock: 30,
      description:
        "An airy knit with a relaxed dropped shoulder. Warm without the weight, in a colour that pairs with everything.",
      specs: [
        ["Material", "Recycled cotton blend"],
        ["Fit", "Oversized"],
        ["Care", "Hand wash"],
      ],
    },
    // Men
    {
      sku: "OLS-04",
      name: "Oversized Linen Shirt",
      price: 1199,
      comarePrice: 1499,
      stock: 36,
      description:
        "A relaxed linen shirt with a soft drape and a camp collar. Breathable in the heat, easy under a jacket in the cold.",
      specs: [
        ["Material", "100% linen"],
        ["Fit", "Oversized"],
        ["Care", "Machine wash cold"],
      ],
    },
    {
      sku: "WDN-05",
      name: "Loose Wide Denim",
      price: 1899,
      comarePrice: 2499,
      stock: 32,
      description:
        "Wide-leg denim that moves with you. Slightly washed-back indigo with a straight fit through the thigh.",
      specs: [
        ["Material", "98% cotton, 2% elastane"],
        ["Wash", "Mid indigo"],
        ["Rise", "Mid"],
      ],
    },
    {
      sku: "PLO-06",
      name: "Everyday Polo",
      price: 899,
      comarePrice: 0,
      stock: 48,
      description:
        "A pique polo that keeps its shape after every wash. Ribbed collar and a two-button placket.",
      specs: [
        ["Material", "Cotton pique"],
        ["Fit", "Regular"],
        ["Care", "Machine wash"],
      ],
    },
    // Accessories
    {
      sku: "SCF-07",
      name: "Woven Wool Scarf",
      price: 649,
      comarePrice: 899,
      stock: 50,
      description: "A soft woven scarf with hand-finished fringing. Long enough to wrap twice.",
      specs: [
        ["Material", "Wool blend"],
        ["Size", "180 x 35 cm"],
        ["Care", "Dry clean"],
      ],
    },
    {
      sku: "CBG-08",
      name: "Canvas Tote Bag",
      price: 749,
      comarePrice: 0,
      stock: 60,
      description:
        "A structured canvas tote with an inner pocket and reinforced handles. Carries the week without complaint.",
      specs: [
        ["Material", "Heavy canvas"],
        ["Size", "38 x 40 cm"],
        ["Care", "Spot clean"],
      ],
    },
    {
      sku: "BLT-09",
      name: "Leather Slim Belt",
      price: 999,
      comarePrice: 1299,
      stock: 40,
      description: "A full-grain leather belt with a brushed buckle. Ages into its own character.",
      specs: [
        ["Material", "Full-grain leather"],
        ["Width", "3 cm"],
        ["Care", "Condition yearly"],
      ],
    },
    // Sale (cross-listed with their home category)
    {
      sku: "WBC-10",
      name: "Wool Blend Coat",
      price: 4999,
      comarePrice: 7999,
      stock: 8,
      description:
        "A structured coat in a soft wool blend. Brushed lapels and a hidden button front for a clean line.",
      specs: [
        ["Material", "Wool blend"],
        ["Length", "Below knee"],
        ["Fit", "Tailored"],
      ],
    },
    {
      sku: "MJB-11",
      name: "Denim Trucker Jacket",
      price: 2299,
      comarePrice: 3499,
      stock: 14,
      description:
        "A classic trucker cut in rigid denim that softens with wear. Chest pockets and a slightly cropped hem.",
      specs: [
        ["Material", "100% cotton denim"],
        ["Wash", "Light indigo"],
        ["Fit", "Regular"],
      ],
    },
    {
      sku: "KDR-12",
      name: "Ribbed Knit Dress",
      price: 1699,
      comarePrice: 2399,
      stock: 20,
      description:
        "A body-skimming ribbed knit with long sleeves and a mid-calf hem. Cut for layering and for wearing alone.",
      specs: [
        ["Material", "Ribbed viscose blend"],
        ["Length", "Mid-calf"],
        ["Care", "Hand wash"],
      ],
    },
    {
      sku: "HCH-13",
      name: "Checked Shirt",
      price: 1099,
      comarePrice: 1599,
      stock: 26,
      description:
        "A brushed cotton check shirt with a soft handle. Wear open over a tee or buttoned with chinos.",
      specs: [
        ["Material", "Brushed cotton"],
        ["Fit", "Regular"],
        ["Care", "Machine wash"],
      ],
    },
    {
      sku: "CQP-14",
      name: "Pleated Midi Skirt",
      price: 1399,
      comarePrice: 0,
      stock: 22,
      description:
        "Pleats that swing as you move. Satin-finish waistband with a concealed side zip.",
      specs: [
        ["Material", "Recycled polyester satin"],
        ["Length", "Midi"],
        ["Care", "Machine wash cold"],
      ],
    },
  ];

  const seedProducts = [];
  for (const [index, plan] of PRODUCT_PLAN.entries()) {
    let category = women;
    let extraCategory = null;

    if (
      plan.sku === "OLS-04" ||
      plan.sku === "WDN-05" ||
      plan.sku === "PLO-06" ||
      plan.sku === "MJB-11" ||
      plan.sku === "HCH-13"
    ) {
      category = men;
    } else if (plan.sku === "SCF-07" || plan.sku === "CBG-08" || plan.sku === "BLT-09") {
      category = accessories;
    }

    // Cross-list a few into Sale to exercise multi-category products.
    if (
      ["WBC-10", "MJB-11", "KDR-12", "HCH-13", "RWJ-01", "FLD-02", "OLS-04", "WDN-05"].includes(
        plan.sku,
      )
    ) {
      extraCategory = sale;
    }

    // Two products have no vendor: the rest belong to one of the stores.
    const vendor =
      plan.sku === "WBC-10" || plan.sku === "CQP-14" ? null : index % 2 === 0 ? vendor1 : vendor2;

    seedProducts.push(await upsertProduct({ category, vendor, extraCategory, data: plan, index }));
  }

  // ---- Orders across different dates ----
  const seedOrders = [];
  for (const [index, plan] of ORDER_PLAN.entries()) {
    seedOrders.push(await createOrder({ products: seedProducts, customers, plan, index }));
  }

  // Keep the category product arrays in sync with the assignment.
  for (const category of [women, men, accessories, sale]) {
    const ids = seedProducts
      .filter(
        (p) =>
          category._id.equals(p.categoryId) ||
          (p.categoryIds ?? []).some((id) => category._id.equals(id)),
      )
      .map((p) => p._id);
    category.products = ids;
    await category.save();
  }

  console.log("Seed complete:");
  console.log(`  categories: ${[women, men, accessories, sale].length}`);
  console.log(`  customers:  ${customers.length}`);
  console.log(`  vendors:    2 (approved)`);
  console.log(`  products:   ${seedProducts.length} (no images, active)`);
  console.log(`  orders:     ${seedOrders.length} spread over the last 60 days`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
