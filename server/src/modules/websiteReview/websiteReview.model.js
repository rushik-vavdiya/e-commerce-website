import mongoose from "mongoose";

// Reviews of the website itself. These are text only (no media) and keep the
// author's userId so the public list can show their name and profile picture.
const websiteReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    comment: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

websiteReviewSchema.index({ userId: 1 }, { unique: true });
websiteReviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("WebsiteReview", websiteReviewSchema);
