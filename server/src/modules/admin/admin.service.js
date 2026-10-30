import User from "../user/user.model.js";
import { UserRepository } from "../user/user.repository.js";
import Vendor from "../vendor/vendor.model.js";
import Product from "../product/product.model.js";
import Category from "../category/category.model.js";
import Order from "../order/order.model.js";
import Payment from "../payment/payment.model.js";
import Coupon from "../coupon/coupon.model.js";
import Review from "../review/review.model.js";
import { AppError } from "../../utils/AppError.js";

export const getDashboard = async () => {
  const [
    users,
    vendors,
    pendingVendors,
    products,
    pendingProducts,
    categories,
    orders,
    payments,
    coupons,
    pendingReviews,
  ] = await Promise.all([
    User.countDocuments(),
    Vendor.countDocuments(),
    Vendor.countDocuments({ approvalStatus: "pending" }),
    Product.countDocuments(),
    Product.countDocuments({ status: "draft" }),
    Category.countDocuments(),
    Order.countDocuments(),
    Payment.countDocuments(),
    Coupon.countDocuments(),
    Review.countDocuments({ status: "pending" }),
  ]);
  return {
    users,
    vendors,
    pendingVendors,
    products,
    pendingProducts,
    categories,
    orders,
    payments,
    coupons,
    pendingReviews,
  };
};

export const listUsers = () =>
  User.find({}, "firstName lastName email phone role status emailVerified createdAt")
    .sort({ createdAt: -1 })
    .limit(100);

// Reuses the same user update the account area uses, but returns only the
// fields the admin list shows.
export const setUserStatus = async (userId, status, adminId) => {
  if (userId === adminId && status === "inactive") {
    throw new AppError("Admins cannot deactivate their own account", 403);
  }

  const user = await UserRepository.changeUserStatus(
    userId,
    status,
    "firstName lastName email phone role status emailVerified",
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
};
