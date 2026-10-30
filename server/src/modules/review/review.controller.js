import * as reviewService from "./review.service.js";

export const createReview = async (req, res, next) => {
  try {
    return res.status(201).json({
      success: true,
      message: "Review submitted for moderation",
      data: await reviewService.createReview(req.user.id, req.body),
    });
  } catch (error) {
    return next(error);
  }
};
export const listReviews = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Reviews fetched",
      data: await reviewService.listProductReviews(req.params.productId),
    });
  } catch (error) {
    return next(error);
  }
};
export const updateReview = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Review updated",
      data: await reviewService.updateReview(req.params.reviewId, req.user.id, req.body),
    });
  } catch (error) {
    return next(error);
  }
};
export const addReviewMedia = async (req, res, next) => {
  try {
    return res.status(201).json({
      success: true,
      message: "Review media added",
      data: await reviewService.addReviewMedia(req.params.reviewId, req.user.id, req.files ?? []),
    });
  } catch (error) {
    return next(error);
  }
};
export const deleteReviewMedia = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Review media removed",
      data: await reviewService.deleteReviewMedia(
        req.params.reviewId,
        req.user.id,
        req.params.mediaIndex,
      ),
    });
  } catch (error) {
    return next(error);
  }
};
export const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.reviewId, req.user.id, req.user.role === "admin");
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return next(error);
  }
};
export const listPendingReviews = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Pending reviews fetched",
      data: await reviewService.listPendingReviews(),
    });
  } catch (error) {
    return next(error);
  }
};
export const moderateReview = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Review moderated",
      data: await reviewService.moderateReview(req.params.reviewId, req.body.status),
    });
  } catch (error) {
    return next(error);
  }
};
