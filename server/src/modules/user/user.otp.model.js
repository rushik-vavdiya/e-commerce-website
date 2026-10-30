import mongoose from "mongoose";

const userOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    resetOTP: {
      type: String,
      default: null,
    },
    resetExpiresAt: {
      type: Date,
      default: null,
    },
    resetAttempts: { type: Number, default: 0 },
    verifyEmailOTP: {
      type: String,
    },
    verifyEmailExpiresAt: {
      type: Date,
      default: null,
    },
    verifyEmailAttempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const UserOTP = mongoose.model("UserOTP", userOTPSchema);

export default UserOTP;
