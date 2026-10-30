import Payment from "./payment.model.js";

export const paymentRepository = {
  create: (data) => Payment.create(data),
  findByIdempotencyKey: (userId, orderId, key) =>
    Payment.findOne({ userId, orderId, idempotencyKey: key }),
  findForOrder: (orderId, userId) => Payment.findOne({ orderId, userId }).sort({ createdAt: -1 }),
  findByOrder: (orderId) => Payment.findOne({ orderId }).sort({ createdAt: -1 }),
  findByProviderOrderId: (providerOrderId) => Payment.findOne({ providerOrderId }),
  findByProviderPaymentId: (providerPaymentId) => Payment.findOne({ providerPaymentId }),
  findPendingForOrder: (orderId) =>
    Payment.findOne({ orderId, status: "pending", providerOrderId: { $ne: null } }).sort({
      createdAt: -1,
    }),
  findFailedForOrder: (orderId) =>
    Payment.findOne({ orderId, status: "failed", providerOrderId: { $ne: null } }).sort({
      createdAt: -1,
    }),
  update: (paymentId, filter, data) =>
    Payment.findOneAndUpdate(
      { _id: paymentId, ...filter },
      { $set: data },
      { new: true, runValidators: true },
    ),
  addWebhookEvent: (paymentId, eventId, data) =>
    Payment.findOneAndUpdate(
      { _id: paymentId, processedWebhookEvents: { $ne: eventId } },
      { $set: data, $addToSet: { processedWebhookEvents: eventId } },
      { new: true, runValidators: true },
    ),
  addRefund: (paymentId, refundId) =>
    Payment.findOneAndUpdate(
      { _id: paymentId },
      { $addToSet: { providerRefundIds: refundId }, $set: { refundStatus: "pending" } },
      { new: true },
    ),
  startRefund: (paymentId) =>
    Payment.findOneAndUpdate(
      {
        _id: paymentId,
        status: { $in: ["captured", "partially_refunded"] },
        refundStatus: { $ne: "pending" },
      },
      { $set: { refundStatus: "pending" } },
      { new: true },
    ),
  failRefund: (paymentId) =>
    Payment.findOneAndUpdate(
      { _id: paymentId, refundStatus: "pending" },
      { $set: { refundStatus: "failed" } },
      { new: true },
    ),
};
