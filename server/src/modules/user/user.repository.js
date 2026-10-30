import User from "./user.model.js";

// The one place the User collection is queried. Both the auth module and the
// profile module go through it, so sign-in and profile edits can never drift.
export const UserRepository = {
  findById: (userId) => User.findById(userId),
  findByEmail: (email) => User.findOne({ email }),
  findByPhone: (phone) => User.findOne({ phone }),

  create: (userData) => User.create(userData),
  deleteUser: (userId) => User.findByIdAndDelete(userId),

  // `updateData` holds the values to write and `unsetFields` the optional
  // profile values the person cleared, which are removed from the document.
  updateUser: async (userId, updateData, unsetFields = []) => {
    const update = {};
    if (Object.keys(updateData).length > 0) update.$set = updateData;
    if (unsetFields.length > 0) {
      update.$unset = Object.fromEntries(unsetFields.map((field) => [field, 1]));
    }
    if (Object.keys(update).length === 0) {
      return User.findById(userId);
    }
    return User.findByIdAndUpdate(userId, update, { returnDocument: "after", runValidators: true });
  },

  changeUserStatus: (userId, status, fields = null) => {
    const query = User.findByIdAndUpdate(
      userId,
      { $set: { status }, $inc: { tokenVersion: 1 } },
      { returnDocument: "after", runValidators: true },
    );
    return fields ? query.select(fields) : query;
  },

  updateProfilePicture: (userId, profilePicture, profilePicturePublicId) =>
    User.findByIdAndUpdate(
      userId,
      { profilePicture, profilePicturePublicId },
      { returnDocument: "after", runValidators: true },
    ),
};
