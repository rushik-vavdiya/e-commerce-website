import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
    },
    method: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "cod", "other"],
      default: "other",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
      match: /^[A-Z]{3}$/,
      default: "INR",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "authorized",
        "captured",
        "failed",
        "cancelled",
        "partially_refunded",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    providerOrderId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    providerPaymentId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    processedWebhookEvents: {
      type: [String],
      default: [],
    },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
    providerRefundIds: {
      type: [String],
      default: [],
    },
    failureCode: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    failureMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    authorizedAt: { type: Date, default: null },
    capturedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    strict: "throw",
  },
);

paymentSchema.index(
  { provider: 1, providerPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerPaymentId: { $type: "string" } },
  },
);
paymentSchema.index(
  { userId: 1, orderId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
  },
);
paymentSchema.index({ orderId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

paymentSchema.pre("validate", function () {
  if (this.refundedAmount > this.amount) {
    this.invalidate("refundedAmount", "Refunded amount cannot be greater than payment amount");
  }
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
