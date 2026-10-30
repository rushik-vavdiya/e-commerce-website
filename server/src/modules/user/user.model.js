import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    birthDate: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // ---------------------------------------------------------------
    // Email verification + password recovery (token-hash based). Each
    // action token is 256 bits of entropy; only its SHA-256 hash is
    // stored, so a database dump cannot mint working links.
    // ---------------------------------------------------------------
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    emailVerificationTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    // Legacy invalidation counter from the previous auth system. Sessions are
    // now revoked through the Session collection, so this stays untouched.
    tokenVersion: {
      type: Number,
      default: 0,
    },
    profilePicture: {
      type: String,
    },
    profilePicturePublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Never send the password hash, the action-token hashes, or the Cloudinary
// public id to a client. Doing it once here means every controller can return
// a user document as-is (fresh documents included, where select:false alone
// would not strip these).
userSchema.set("toJSON", {
  transform: (_document, returned) => {
    delete returned.password;
    delete returned.profilePicturePublicId;
    delete returned.emailVerificationTokenHash;
    delete returned.emailVerificationExpiresAt;
    delete returned.passwordResetTokenHash;
    delete returned.passwordResetExpiresAt;
    delete returned.passwordChangedAt;
    return returned;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
