import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
  },
  storeDescription: {
    type: String,
    required: true,
    trim: true,
  },
  storeAddress: {
    type: String,
    required: true,
  },
  storeContact: {
    type: String,
    required: true,
  },
  storeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  storeLogo: {
    type: String,
  },
  storeBanner: {
    type: String,
  },
  storeSocial: {
    instagram: {
      type: String,
      default: null,
    },
    facebook: {
      type: String,
      default: null,
    },
    youtube: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "under_review", "approved", "rejected"],
    default: "pending",
    index: true,
  },

  rejectionReason: {
    type: String,
    default: null,
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "inactive",
    index: true,
  },
});

vendorSchema.index({ approvalStatus: 1, createdAt: -1 });

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
