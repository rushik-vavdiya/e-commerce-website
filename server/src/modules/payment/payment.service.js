import { createHmac, timingSafeEqual } from "node:crypto";
import env from "../../config/env.js";
import Cart from "../cart/cart.model.js";
import Order from "../order/order.model.js";
import { orderRepository } from "../order/order.repository.js";
import { paymentRepository } from "./payment.repository.js";
import Payment from "./payment.model.js";
import { AppError } from "../../utils/AppError.js";

const razorpayRequest = async (path, method = "GET", body) => {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new AppError("Razorpay is not configured", 503);
  }

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AppError("Payment provider request failed", 502);
  }
  return data;
};

const validSignature = (value, expected) => {
  if (typeof value !== "string" || typeof expected !== "string") return false;
  const received = Buffer.from(value, "hex");
  const actual = Buffer.from(expected, "hex");
  return received.length === actual.length && timingSafeEqual(received, actual);
};

const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.razorpay.webhookSecret || !Buffer.isBuffer(rawBody) || !signature) return false;
  return validSignature(
    signature,
    createHmac("sha256", env.razorpay.webhookSecret).update(rawBody).digest("hex"),
  );
};

const settlePayment = async (payment, providerPayment) => {
  if (
    providerPayment.status !== "captured" ||
    providerPayment.order_id !== payment.providerOrderId ||
    providerPayment.amount !== Math.round(payment.amount * 100) ||
    providerPayment.currency !== payment.currency
  ) {
    throw new AppError("Payment details do not match the order", 400);
  }

  await paymentRepository.update(
    payment._id,
    {},
    {
      status: "captured",
      providerPaymentId: providerPayment.id,
      method: ["card", "upi", "netbanking", "wallet"].includes(providerPayment.method)
        ? providerPayment.method
        : "other",
      capturedAt: new Date(),
      failureCode: null,
      failureMessage: null,
    },
  );

  await orderRepository.changeStatus(
    payment.orderId,
    {
      paymentStatus: { $in: ["unpaid", "pending"] },
    },
    {
      paymentStatus: "paid",
      orderStatus: "confirmed",
      statusNote: "Payment confirmed",
    },
  );

  // The cart is only emptied once the money is confirmed, which is why an online
  // order leaves the cart alone until this point. Doing it here means a retry or
  // a webhook arriving twice cannot break anything.
  await Cart.findOneAndUpdate({ userId: payment.userId }, { $set: { products: [] } });
};

export const createPayment = async (userId, { orderId, idempotencyKey }) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new AppError("Order not found", 404);
  if (order.paymentMethod === "cod") {
    throw new AppError("This order is cash on delivery", 400);
  }
  if (order.orderStatus !== "pending" || !["unpaid", "failed"].includes(order.paymentStatus)) {
    throw new AppError("Order is not available for payment", 400);
  }

  const existing = await paymentRepository.findByIdempotencyKey(userId, orderId, idempotencyKey);
  if (existing) {
    if (existing.status === "failed" && existing.providerOrderId) {
      await paymentRepository.update(
        existing._id,
        {},
        { status: "pending", failureCode: null, failureMessage: null, failedAt: null },
      );
      await orderRepository.changeStatus(
        orderId,
        { paymentStatus: "failed" },
        { paymentStatus: "pending" },
      );
      return {
        keyId: env.razorpay.keyId,
        providerOrderId: existing.providerOrderId,
        amount: Math.round(existing.amount * 100),
        currency: existing.currency,
        paymentId: existing._id,
      };
    }
    if (existing.providerOrderId) {
      return {
        keyId: env.razorpay.keyId,
        providerOrderId: existing.providerOrderId,
        amount: Math.round(existing.amount * 100),
        currency: existing.currency,
        paymentId: existing._id,
      };
    }
  }

  const pendingPayment = await paymentRepository.findPendingForOrder(orderId);
  if (pendingPayment) {
    return {
      keyId: env.razorpay.keyId,
      providerOrderId: pendingPayment.providerOrderId,
      amount: Math.round(pendingPayment.amount * 100),
      currency: pendingPayment.currency,
      paymentId: pendingPayment._id,
    };
  }

  const failedPayment = await paymentRepository.findFailedForOrder(orderId);
  if (failedPayment) {
    await paymentRepository.update(
      failedPayment._id,
      {},
      { status: "pending", failureCode: null, failureMessage: null, failedAt: null },
    );
    await orderRepository.changeStatus(
      orderId,
      { paymentStatus: "failed" },
      { paymentStatus: "pending" },
    );
    return {
      keyId: env.razorpay.keyId,
      providerOrderId: failedPayment.providerOrderId,
      amount: Math.round(failedPayment.amount * 100),
      currency: failedPayment.currency,
      paymentId: failedPayment._id,
    };
  }

  const payment =
    existing ||
    (await paymentRepository.create({
      orderId,
      userId,
      provider: "razorpay",
      amount: order.totalAmount,
      currency: order.currency,
      status: "pending",
      idempotencyKey,
    }));
  await paymentRepository.update(
    payment._id,
    {},
    { status: "pending", failureCode: null, failureMessage: null, failedAt: null },
  );
  await orderRepository.changeStatus(
    orderId,
    { paymentStatus: { $in: ["unpaid", "failed"] } },
    { paymentStatus: "pending" },
  );

  try {
    const providerOrder = await razorpayRequest("/orders", "POST", {
      amount: Math.round(order.totalAmount * 100),
      currency: order.currency,
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString(), userId: userId.toString() },
    });
    await paymentRepository.update(payment._id, {}, { providerOrderId: providerOrder.id });
    return {
      keyId: env.razorpay.keyId,
      providerOrderId: providerOrder.id,
      amount: providerOrder.amount,
      currency: providerOrder.currency,
      paymentId: payment._id,
    };
  } catch (error) {
    await paymentRepository.update(
      payment._id,
      {},
      { status: "failed", failureMessage: "Payment could not be started", failedAt: new Date() },
    );
    await orderRepository.changeStatus(
      orderId,
      { paymentStatus: "pending" },
      { paymentStatus: "failed" },
    );
    throw error;
  }
};

// Admin order screen: the payment references and refund state for one order.
// Returns null when the order was cash on delivery or never started a payment.
export const getPaymentForOrder = async (orderId) =>
  paymentRepository.findByOrder(orderId);

export const verifyPayment = async (
  userId,
  { orderId, providerOrderId, providerPaymentId, signature },
) => {
  const payment = await paymentRepository.findForOrder(orderId, userId);
  if (!payment || payment.providerOrderId !== providerOrderId)
    throw new AppError("Payment not found", 404);
  if (payment.status === "captured") return payment;

  const expected = createHmac("sha256", env.razorpay.keySecret || "")
    .update(`${providerOrderId}|${providerPaymentId}`)
    .digest("hex");
  if (!env.razorpay.keySecret || !validSignature(signature, expected)) {
    throw new AppError("Invalid payment signature", 400);
  }

  let providerPayment = await razorpayRequest(`/payments/${encodeURIComponent(providerPaymentId)}`);
  if (providerPayment.status === "authorized") {
    await razorpayRequest(`/payments/${encodeURIComponent(providerPaymentId)}/capture`, "POST", {
      amount: Math.round(payment.amount * 100),
      currency: payment.currency,
    });
    providerPayment = await razorpayRequest(`/payments/${encodeURIComponent(providerPaymentId)}`);
  }
  await settlePayment(payment, providerPayment);
  return paymentRepository.findForOrder(orderId, userId);
};

export const processRazorpayWebhook = async (rawBody, signature, eventId) => {
  if (!verifyWebhookSignature(rawBody, signature))
    throw new AppError("Invalid payment webhook signature", 400);
  const event = JSON.parse(rawBody.toString("utf8"));
  if (!eventId || typeof eventId !== "string")
    throw new AppError("Payment webhook event ID is required", 400);

  if (event.event === "payment.captured") {
    const providerPayment = event.payload?.payment?.entity;
    const payment = await paymentRepository.findByProviderOrderId(providerPayment?.order_id);
    if (!payment) return true;
    const processingId = `payment.captured:${providerPayment.id}`;
    if (payment.processedWebhookEvents.includes(processingId)) return true;
    const expected = Math.round(payment.amount * 100);
    if (providerPayment.amount !== expected || providerPayment.currency !== payment.currency) {
      throw new AppError("Payment webhook amount does not match the order", 400);
    }
    const savedEvent = await paymentRepository.addWebhookEvent(payment._id, processingId, {
      status: "captured",
      providerPaymentId: providerPayment.id,
      capturedAt: new Date(),
    });
    if (savedEvent) await settlePayment(payment, providerPayment);
  } else if (event.event === "payment.failed") {
    const providerPayment = event.payload?.payment?.entity;
    const payment = await paymentRepository.findByProviderOrderId(providerPayment?.order_id);
    const processingId = providerPayment?.id ? `payment.failed:${providerPayment.id}` : null;
    if (payment && processingId && !payment.processedWebhookEvents.includes(processingId)) {
      if (
        payment.status === "captured" ||
        payment.status === "refunded" ||
        payment.status === "partially_refunded"
      )
        return true;
      const savedEvent = await paymentRepository.addWebhookEvent(payment._id, processingId, {
        status: "failed",
        failureCode: String(providerPayment.error_code || "PAYMENT_FAILED"),
        failureMessage: "Payment provider reported a failed payment",
        failedAt: new Date(),
      });
      if (savedEvent)
        await orderRepository.changeStatus(
          payment.orderId,
          { paymentStatus: "pending" },
          { paymentStatus: "failed" },
        );
    }
  } else if (event.event === "refund.processed") {
    const refund = event.payload?.refund?.entity;
    const payment = await paymentRepository.findByProviderPaymentId(refund?.payment_id);
    const processingId = refund?.id ? `refund.processed:${refund.id}` : null;
    if (payment && processingId && !payment.processedWebhookEvents.includes(processingId)) {
      const refundedAmount = Math.min(payment.amount, payment.refundedAmount + refund.amount / 100);
      await paymentRepository.addWebhookEvent(payment._id, processingId, {
        refundedAmount,
        status: refundedAmount >= payment.amount ? "refunded" : "partially_refunded",
        refundStatus: "processed",
        refundedAt: new Date(),
      });
      await orderRepository.changeStatus(
        payment.orderId,
        {},
        {
          paymentStatus: refundedAmount >= payment.amount ? "refunded" : "partially_refunded",
        },
      );
    }
  } else if (event.event === "refund.failed") {
    const refund = event.payload?.refund?.entity;
    const payment = await paymentRepository.findByProviderPaymentId(refund?.payment_id);
    const processingId = refund?.id ? `refund.failed:${refund.id}` : null;
    if (payment && processingId && !payment.processedWebhookEvents.includes(processingId)) {
      await paymentRepository.addWebhookEvent(payment._id, processingId, {
        refundStatus: "failed",
      });
    }
  }
  return true;
};

export const refundPayment = async (paymentId, amount) => {
  const payment = await Payment.findById(paymentId);
  if (!payment || !["captured", "partially_refunded"].includes(payment.status))
    throw new AppError("Captured payment not found", 404);
  const refundAmount = amount ?? payment.amount - payment.refundedAmount;
  if (
    !Number.isFinite(refundAmount) ||
    refundAmount <= 0 ||
    refundAmount > payment.amount - payment.refundedAmount
  ) {
    throw new AppError("Invalid refund amount", 400);
  }
  if (!payment.providerPaymentId) throw new AppError("Payment provider reference not found", 400);
  if (!(await paymentRepository.startRefund(payment._id)))
    throw new AppError("A refund is already being processed", 409);
  try {
    const refund = await razorpayRequest(
      `/payments/${encodeURIComponent(payment.providerPaymentId)}/refund`,
      "POST",
      {
        amount: Math.round(refundAmount * 100),
      },
    );
    await paymentRepository.addRefund(payment._id, refund.id);
    return { refundId: refund.id, status: refund.status };
  } catch (error) {
    await paymentRepository.failRefund(payment._id);
    throw error;
  }
};
