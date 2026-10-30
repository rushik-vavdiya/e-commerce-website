import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    // The address format is checked by newsletterSubscribeSchema. This model
    // only stores it, so a valid address is never rejected here.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);
export default Newsletter;
