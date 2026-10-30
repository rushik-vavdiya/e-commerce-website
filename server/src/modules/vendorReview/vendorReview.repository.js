import VendorReview from "./vendorReview.model.js";

export const vendorReviewRepository = {
  create: (data) => VendorReview.create(data),
  findById: (id) => VendorReview.findById(id),
  findOwned: (id, userId) => VendorReview.findOne({ _id: id, userId }),
  listForVendor: (vendorId) =>
    VendorReview.find({ vendorId, status: "approved" })
      .populate("userId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(100),
  listPending: () =>
    VendorReview.find({ status: "pending" })
      .populate("userId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(100),
  addMedia: (id, userId, media) =>
    VendorReview.findOneAndUpdate(
      { _id: id, userId },
      { $push: { media: { $each: media } } },
      { new: true },
    ),
  removeMedia: (id, userId, publicId) =>
    VendorReview.findOneAndUpdate(
      { _id: id, userId },
      { $pull: { media: { publicId } } },
      { new: true },
    ),
  update: (id, filter, data) =>
    VendorReview.findOneAndUpdate(
      { _id: id, ...filter },
      { $set: data },
      { new: true, runValidators: true },
    ),
  delete: (id, userId) => VendorReview.findOneAndDelete({ _id: id, userId }),
  deleteById: (id) => VendorReview.findByIdAndDelete(id),
};
