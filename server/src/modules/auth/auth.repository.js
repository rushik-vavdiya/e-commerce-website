import User from "../user/user.model.js";

// Auth-specific reads over the one User collection. Password hashes and the
// action-token hashes are hidden by default, so the lookups that need them
// ask for them explicitly here.
export const AuthUserRepository = {
  createUser: (data) => User.create(data),

  findUserByEmail: (email) => User.findOne({ email: String(email).toLowerCase().trim() }),

  findUserByEmailWithPassword: (email) =>
    User.findOne({ email: String(email).toLowerCase().trim() }).select(
      "+password +passwordChangedAt",
    ),

  findUserByIdWithPassword: (userId) =>
    User.findById(userId).select("+password +passwordChangedAt"),

  findUserByVerificationHash: (tokenHash) =>
    User.findOne({ emailVerificationTokenHash: tokenHash }).select(
      "+emailVerificationTokenHash +emailVerificationExpiresAt",
    ),

  findUserByResetHash: (tokenHash) =>
    User.findOne({ passwordResetTokenHash: tokenHash }).select(
      "+passwordResetTokenHash +passwordResetExpiresAt",
    ),

  saveUser: (user) => user.save(),
};
