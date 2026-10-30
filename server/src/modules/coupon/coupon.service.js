import { couponRepository } from "./coupon.repository.js";
import Coupon from "./coupon.model.js";
import Cart from "../cart/cart.model.js";
import { AppError } from "../../utils/AppError.js";

const safeAdminFields = [
  "code",
  "discountType",
  "discountValue",
  "maxDiscountAmount",
  "minOrderAmount",
  "maxUses",
  "perUserLimit",
  "startsAt",
  "expiresAt",
  "productIds",
  "categoryIds",
  "active",
];

export const createCoupon = (data) =>
  couponRepository.create(
    Object.fromEntries(Object.entries(data).filter(([key]) => safeAdminFields.includes(key))),
  );
export const listCoupons = () => couponRepository.list();

export const updateCoupon = async (couponId, data) => {
  const coupon = await couponRepository.update(
    couponId,
    Object.fromEntries(Object.entries(data).filter(([key]) => safeAdminFields.includes(key))),
  );
  if (!coupon) throw new AppError("Coupon not found", 404);
  return coupon;
};

export const deleteCoupon = async (couponId) => {
  const coupon = await couponRepository.delete(couponId);
  if (!coupon) throw new AppError("Coupon not found", 404);
  return coupon;
};

export const validateCoupon = async (code, userId, subtotal, items = []) => {
  const coupon = await couponRepository.findByCode(String(code || "").trim());
  const now = new Date();
  if (!coupon || !coupon.active || coupon.startsAt > now || coupon.expiresAt <= now)
    throw new AppError("Coupon is invalid or expired", 400);
  if (subtotal < coupon.minOrderAmount)
    throw new AppError("Order does not meet the coupon minimum", 400);
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    throw new AppError("Coupon usage limit reached", 409);
  const userUsage =
    coupon.usedBy.find((entry) => entry.userId.toString() === userId.toString())?.count || 0;
  if (userUsage >= coupon.perUserLimit)
    throw new AppError("Coupon already used the allowed number of times", 400);

  const eligibleItems = items.filter(
    (item) =>
      (!coupon.productIds.length || coupon.productIds.some((id) => id.equals(item.productId))) &&
      (!coupon.categoryIds.length || coupon.categoryIds.some((id) => id.equals(item.categoryId))),
  );
  if (!eligibleItems.length) {
    throw new AppError("Coupon does not apply to these products", 400);
  }

  const discountBase = eligibleItems.reduce((total, item) => total + item.lineTotal, 0);
  let discountAmount =
    coupon.discountType === "percentage"
      ? (discountBase * coupon.discountValue) / 100
      : coupon.discountValue;
  if (coupon.maxDiscountAmount !== null)
    discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  return { coupon, discountAmount: Math.min(Math.round(discountAmount * 100) / 100, discountBase) };
};

// Checks a code against the signed-in customer's own cart and returns the rows
// the checkout shows. The cart pricing lives here so the controller only
// forwards the request and the response.
export const validateCouponForCart = async (userId, code) => {
  const cart = await Cart.findOne({ userId }).populate("products.productId");
  if (!cart?.products.length) throw new AppError("Cart is empty", 400);

  const items = cart.products.map((item) => {
    const product = item.productId;
    if (!product || product.status !== "active") throw new AppError("Product not available", 400);
    const variant = item.variantId ? product.variantCombinations.id(item.variantId) : null;
    if (item.variantId && !variant) throw new AppError("Product variant not found", 404);
    return {
      productId: product._id,
      categoryId: product.categoryId,
      lineTotal: (variant?.price ?? product.price) * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const { coupon, discountAmount } = await validateCoupon(code, userId, subtotal, items);
  return { code: coupon.code, discountAmount };
};

export const redeemCoupon = async (coupon, userId) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const current = await couponRepository.findById(coupon._id);
    if (
      !current ||
      !current.active ||
      (current.maxUses !== null && current.usedCount >= current.maxUses)
    )
      return null;
    const currentUsage = current.usedBy.find(
      (entry) => entry.userId.toString() === userId.toString(),
    );
    if ((currentUsage?.count || 0) >= current.perUserLimit) return null;
    const filter = {
      _id: current._id,
      active: true,
      $or: [{ maxUses: null }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }],
    };
    if (currentUsage) {
      filter.usedBy = { $elemMatch: { userId, count: { $lt: current.perUserLimit } } };
      const updated = await Coupon.findOneAndUpdate(
        filter,
        { $inc: { usedCount: 1, "usedBy.$.count": 1 } },
        { new: true },
      );
      if (updated) return updated;
    } else {
      filter.usedBy = { $not: { $elemMatch: { userId } } };
      const updated = await Coupon.findOneAndUpdate(
        filter,
        { $inc: { usedCount: 1 }, $push: { usedBy: { userId, count: 1 } } },
        { new: true },
      );
      if (updated) return updated;
    }
  }
  return null;
};

export const undoCouponRedemption = async (couponId, userId) => {
  const coupon = await couponRepository.findById(couponId);
  const usage = coupon?.usedBy.find((entry) => entry.userId.toString() === userId.toString());
  if (!usage) return;
  if (usage.count > 1) {
    await Coupon.findOneAndUpdate(
      { _id: couponId, usedBy: { $elemMatch: { userId, count: { $gt: 1 } } } },
      { $inc: { usedCount: -1, "usedBy.$.count": -1 } },
    );
  } else {
    await Coupon.findOneAndUpdate(
      { _id: couponId, usedBy: { $elemMatch: { userId, count: 1 } } },
      { $inc: { usedCount: -1 }, $pull: { usedBy: { userId } } },
    );
  }
};

export const undoCouponRedemptionByCode = async (code, userId) => {
  const coupon = await couponRepository.findByCode(code);
  if (coupon) await undoCouponRedemption(coupon._id, userId);
};
