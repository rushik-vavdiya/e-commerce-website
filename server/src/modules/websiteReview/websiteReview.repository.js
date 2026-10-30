import WebsiteReview from "./websiteReview.model.js";

const userFields = "firstName lastName profilePicture";

export const websiteReviewRepository = {
  create: (data) => WebsiteReview.create(data),
  findOwned: (id, userId) => WebsiteReview.findOne({ _id: id, userId }),
  listApproved: () =>
    WebsiteReview.find({ status: "approved" })
      .populate("userId", userFields)
      .sort({ createdAt: -1 })
      .limit(100),
  listPending: () =>
    WebsiteReview.find({ status: "pending" })
      .populate("userId", userFields)
      .sort({ createdAt: -1 })
      .limit(100),
  update: (id, filter, data) =>
    WebsiteReview.findOneAndUpdate(
      { _id: id, ...filter },
      { $set: data },
      { new: true, runValidators: true },
    ),
  delete: (id, userId) => WebsiteReview.findOneAndDelete({ _id: id, userId }),
};
