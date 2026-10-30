import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 40,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0.01 },
    maxDiscountAmount: { type: Number, min: 0, default: null },
    minOrderAmount: { type: Number, min: 0, default: 0 },
    maxUses: { type: Number, min: 1, default: null },
    perUserLimit: { type: Number, min: 1, default: 1 },
    usedCount: { type: Number, min: 0, default: 0 },
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 1 },
      },
    ],
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

couponSchema.index({ active: 1, expiresAt: 1 });
export default mongoose.model("Coupon", couponSchema);
