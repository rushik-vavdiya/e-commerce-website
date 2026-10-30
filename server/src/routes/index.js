import { Router } from "express";
import addressRoutes from "../modules/address/address.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import menuRoutes from "../modules/menu/menu.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import wishlistRoutes from "../modules/wishlist/wishlist.routes.js";
import vendorRoutes from "../modules/vendor/vendor.routes.js";
import orderRoutes from "../modules/order/order.routes.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
import couponRoutes from "../modules/coupon/coupon.routes.js";
import reviewRoutes from "../modules/review/review.routes.js";
import vendorReviewRoutes from "../modules/vendorReview/vendorReview.routes.js";
import websiteReviewRoutes from "../modules/websiteReview/websiteReview.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import newsletterRoutes from "../modules/newsletter/newsletter.routes.js";
import contactRoutes from "../modules/contact/contact.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
// The Collections mega menu: departments with their newest products, served
// from a five-minute cache.
router.use("/menu", menuRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", addressRoutes);
router.use("/vendors", vendorRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/coupons", couponRoutes);
router.use("/reviews", reviewRoutes);
router.use("/vendor-reviews", vendorReviewRoutes);
router.use("/website-reviews", websiteReviewRoutes);
router.use("/admin", adminRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/contact", contactRoutes);

export default router;
