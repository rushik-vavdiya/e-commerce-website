import mongoose from "mongoose";

const vendorReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    comment: { type: String, trim: true, maxlength: 2000, default: "" },
    // A vendor review can carry several images and/or short videos.
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], default: "image" },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true },
);

vendorReviewSchema.index({ userId: 1, vendorId: 1 }, { unique: true });
vendorReviewSchema.index({ vendorId: 1, status: 1, createdAt: -1 });

// Hide the Cloudinary public ids from API responses.
vendorReviewSchema.set("toJSON", {
  transform: (document, result) => {
    result.media = (result.media ?? []).map((item) => ({ url: item.url, type: item.type }));
    return result;
  },
});

export default mongoose.model("VendorReview", vendorReviewSchema);
