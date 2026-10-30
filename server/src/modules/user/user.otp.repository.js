import UserOTP from "./user.otp.model.js";

export const UserOTPRepository = {
  findOTPByUserId: async (userId) => {
    const now = new Date();
    await UserOTP.updateOne(
      { userId, resetOTP: { $ne: null }, resetExpiresAt: { $ne: null, $lte: now } },
      { $set: { resetOTP: null, resetExpiresAt: null, resetAttempts: 0 } },
    );
    await UserOTP.updateOne(
      { userId, verifyEmailOTP: { $ne: null }, verifyEmailExpiresAt: { $ne: null, $lte: now } },
      { $set: { verifyEmailOTP: null, verifyEmailExpiresAt: null, verifyEmailAttempts: 0 } },
    );
    return await UserOTP.findOne({ userId });
  },
  updateOTP: async (userId, updateData) => {
    return await UserOTP.findOneAndUpdate(
      { userId },
      { $set: updateData, $setOnInsert: { userId } },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  },
  incrementAttempts: async (userId, field) => {
    if (!["resetAttempts", "verifyEmailAttempts"].includes(field)) return null;
    return UserOTP.findOneAndUpdate(
      { userId },
      { $inc: { [field]: 1 } },
      { returnDocument: "after" },
    );
  },
  consumeResetOTP: async (userId, resetOTP, now) =>
    UserOTP.findOneAndUpdate(
      { userId, resetOTP, resetExpiresAt: { $gt: now }, resetAttempts: { $lt: 5 } },
      { $set: { resetOTP: null, resetExpiresAt: null, resetAttempts: 0 } },
      { returnDocument: "after" },
    ),
  consumeEmailOTP: async (userId, verifyEmailOTP, now) =>
    UserOTP.findOneAndUpdate(
      {
        userId,
        verifyEmailOTP,
        verifyEmailExpiresAt: { $gt: now },
        verifyEmailAttempts: { $lt: 5 },
      },
      { $set: { verifyEmailOTP: null, verifyEmailExpiresAt: null, verifyEmailAttempts: 0 } },
      { returnDocument: "after" },
    ),
};
