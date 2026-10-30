import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    comment: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    verifiedPurchase: { type: Boolean, default: false },
    // Reviewers may attach several images and/or short videos.
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], default: "image" },
      },
    ],
  },
  { timestamps: true },
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
// The Cloudinary public ids stay on the server; clients only need url + type.
reviewSchema.set("toJSON", {
  transform: (document, result) => {
    result.media = (result.media ?? []).map((item) => ({ url: item.url, type: item.type }));
    return result;
  },
});
export default mongoose.model("Review", reviewSchema);
