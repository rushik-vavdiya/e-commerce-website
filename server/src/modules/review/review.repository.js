import Review from "./review.model.js";

export const reviewRepository = {
  create: (data) => Review.create(data),
  findById: (id) => Review.findById(id),
  findOwned: (id, userId) => Review.findOne({ _id: id, userId }),
  listForProduct: (productId) =>
    Review.find({ productId, status: "approved" })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(100),
  listPending: () =>
    Review.find({ status: "pending" })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(100),
  update: (id, filter, data) =>
    Review.findOneAndUpdate(
      { _id: id, ...filter },
      { $set: data },
      { new: true, runValidators: true },
    ),
  addMedia: (id, userId, media) =>
    Review.findOneAndUpdate(
      { _id: id, userId },
      { $push: { media: { $each: media } } },
      { new: true },
    ),
  removeMedia: (id, userId, publicId) =>
    Review.findOneAndUpdate({ _id: id, userId }, { $pull: { media: { publicId } } }, { new: true }),
  delete: (id, userId) => Review.findOneAndDelete({ _id: id, userId }),
  deleteById: (id) => Review.findByIdAndDelete(id),
  ratingStats: async (productId) => {
    const [stats] = await Review.aggregate([
      { $match: { productId, status: "approved" } },
      { $group: { _id: "$productId", average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    return stats || { average: 0, count: 0 };
  },
};
