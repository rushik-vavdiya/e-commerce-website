import Address from "../address/address.model.js";
import Cart from "../cart/cart.model.js";
import User from "../user/user.model.js";
import { productRepository } from "../product/product.repository.js";
import { orderRepository } from "./order.repository.js";
import {
  redeemCoupon,
  undoCouponRedemption,
  undoCouponRedemptionByCode,
  validateCoupon,
} from "../coupon/coupon.service.js";
import { AppError } from "../../utils/AppError.js";

const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

// The address is copied into the order, so editing or deleting the saved address
// later never changes an order that was already placed. Older addresses have no
// name/phone of their own, so the account values are used as the fallback.
const addressSnapshot = (address, user) => ({
  fullName: address.fullName || `${user.firstName} ${user.lastName}`.trim(),
  phone: address.phone || user.phone,
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2 || null,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
});

// The only status changes the API accepts. "packed" and "out_for_delivery" are
// internal tracking steps; nothing pretends to be a live courier feed.
const ORDER_STATUS_FLOW = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const orderStatusFlow = ORDER_STATUS_FLOW;

const restoreReservedStock = async (reserved) => {
  for (const item of reserved) {
    await productRepository.restoreStock(item.productId, item.variantId, item.quantity);
  }
};

export const createOrder = async (
  userId,
  {
    shippingAddressId,
    billingAddressId,
    idempotencyKey,
    couponCode,
    paymentMethod = "razorpay",
  },
) => {
  // createOrderSchema has already checked the addresses and the idempotency
  // key, so this only reads the cart and checks the records it found.
  if (idempotencyKey) {
    const existingOrder = await orderRepository.findByIdempotencyKey(userId, idempotencyKey);
    if (existingOrder) return existingOrder;
  }

  const [user, shippingAddress, billingAddress, cart] = await Promise.all([
    User.findById(userId),
    Address.findOne({ _id: shippingAddressId, userId }),
    billingAddressId ? Address.findOne({ _id: billingAddressId, userId }) : null,
    Cart.findOne({ userId }).populate("products.productId"),
  ]);
  if (!user || user.status !== "active") throw new AppError("User not found", 404);
  if (!shippingAddress || (billingAddressId && !billingAddress))
    throw new AppError("Address not found", 404);
  if (!cart?.products.length) throw new AppError("Cart is empty", 400);

  const reserved = [];
  let createdOrder;
  let redeemedCoupon;
  try {
    const items = [];
    for (const cartItem of cart.products) {
      const product = cartItem.productId;
      if (!product || product.status !== "active") throw new AppError("Product not available", 400);

      const variantId = cartItem.variantId || null;
      const variant = variantId ? product.variantCombinations.id(variantId) : null;
      if (variantId && !variant) throw new AppError("Product variant not found", 404);

      const quantity = cartItem.quantity;
      const stockUpdate = await productRepository.changeStock(product._id, variantId, quantity);
      if (!stockUpdate.modifiedCount) throw new AppError("Not enough product stock", 409);
      reserved.push({ productId: product._id, variantId, quantity });

      const unitPrice = variant ? variant.price : product.price;
      items.push({
        productId: product._id,
        vendorId: product.vendorId,
        variantId,
        productName: product.name,
        sku: variant?.sku || product.sku || null,
        image: variant?.mainImage || product.mainImage || null,
        variantName: variant?.variantName || null,
        unitPrice,
        quantity,
        lineTotal: money(unitPrice * quantity),
      });
    }

    const subtotalAmount = money(items.reduce((total, item) => total + item.lineTotal, 0));
    let discountAmount = 0;
    let coupon;
    if (couponCode) {
      const couponCheck = await validateCoupon(
        couponCode,
        userId,
        subtotalAmount,
        items.map((item) => ({
          productId: item.productId,
          categoryId: cart.products.find((cartItem) =>
            cartItem.productId._id.equals(item.productId),
          )?.productId.categoryId,
          lineTotal: item.lineTotal,
        })),
      );
      coupon = couponCheck.coupon;
      discountAmount = couponCheck.discountAmount;
      redeemedCoupon = await redeemCoupon(coupon, userId);
      if (!redeemedCoupon) throw new AppError("Coupon usage limit reached", 409);
    }
    createdOrder = await orderRepository.create({
      userId,
      idempotencyKey: idempotencyKey || null,
      items,
      shippingAddress: addressSnapshot(shippingAddress, user),
      billingAddress: billingAddress ? addressSnapshot(billingAddress, user) : null,
      currency: "INR",
      subtotalAmount,
      discountAmount,
      couponCode: coupon?.code || null,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: money(subtotalAmount - discountAmount),
      orderStatus: "pending",
      paymentStatus: "unpaid",
      paymentMethod,
      statusHistory: [
        {
          status: "pending",
          at: new Date(),
          note:
            paymentMethod === "cod"
              ? "Order placed — cash on delivery"
              : "Order placed — waiting for payment",
        },
      ],
    });

    // Online orders keep the cart until the payment is verified, so a cancelled
    // payment leaves the items where the customer left them. Cash on delivery is
    // confirmed by the order itself, so the cart is emptied now.
    if (paymentMethod === "cod") {
      await Cart.findOneAndUpdate({ _id: cart._id, userId }, { $set: { products: [] } });
    }
    return createdOrder;
  } catch (error) {
    if (createdOrder) await orderRepository.delete(createdOrder._id);
    if (redeemedCoupon) await undoCouponRedemption(redeemedCoupon._id, userId);
    await restoreReservedStock(reserved);
    throw error;
  }
};

export const getOrders = async (userId, isAdmin = false, filters = {}) =>
  isAdmin ? orderRepository.listAll(filters) : orderRepository.listForUser(userId);

export const getOrder = async (orderId, userId, isAdmin = false) => {
  const order = isAdmin
    ? await orderRepository.findById(orderId)
    : await orderRepository.findForUser(orderId, userId);
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

export const cancelOrder = async (orderId, userId, isAdmin = false) => {
  const order = await getOrder(orderId, userId, isAdmin);
  if (
    !["pending", "confirmed"].includes(order.orderStatus) ||
    !["unpaid", "failed"].includes(order.paymentStatus)
  ) {
    throw new AppError(
      order.paymentStatus === "paid"
        ? "This order is paid. Ask the studio for a refund before cancelling it."
        : "This order can no longer be cancelled",
      400,
    );
  }
  // The filter repeats the statuses that were just checked, so two cancellation
  // requests cannot both restore the stock.
  const cancelled = await orderRepository.changeStatus(
    orderId,
    {
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    },
    { orderStatus: "cancelled", cancelledAt: new Date(), statusNote: "Cancelled" },
  );
  if (!cancelled) throw new AppError("Order has already changed", 409);
  await restoreReservedStock(
    order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  );
  if (cancelled.couponCode)
    await undoCouponRedemptionByCode(cancelled.couponCode, cancelled.userId);
  return cancelled;
};

export const updateOrderStatus = async (orderId, nextStatus) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (!ORDER_STATUS_FLOW[order.orderStatus]?.includes(nextStatus))
    throw new AppError("Invalid order status transition", 400);
  if (nextStatus === "cancelled" && order.paymentStatus === "paid")
    throw new AppError("Paid orders require a refund before cancellation", 400);

  const update = { orderStatus: nextStatus };
  if (nextStatus === "cancelled") update.cancelledAt = new Date();
  if (nextStatus === "delivered") update.deliveredAt = new Date();

  const updated = await orderRepository.changeStatus(
    orderId,
    { orderStatus: order.orderStatus },
    update,
  );
  if (!updated) throw new AppError("Order has already changed", 409);
  return updated;
};

// Courier details are saved separately from the status, so the admin can fill
// them in before or after moving the order to shipped.
export const updateOrderTracking = async (orderId, { trackingNumber, courierName }) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  return orderRepository.updateFields(orderId, {
    trackingNumber: trackingNumber?.trim() || null,
    courierName: courierName?.trim() || null,
  });
};
