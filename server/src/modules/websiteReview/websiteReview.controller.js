import * as websiteReviewService from "./websiteReview.service.js";

export const createWebsiteReview = async (req, res, next) => {
  try {
    return res.status(201).json({
      success: true,
      message: "Website review submitted for moderation",
      data: await websiteReviewService.createWebsiteReview(req.user.id, req.body),
    });
  } catch (error) {
    return next(error);
  }
};

export const listWebsiteReviews = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Website reviews fetched",
      data: await websiteReviewService.listWebsiteReviews(),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateWebsiteReview = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Website review updated",
      data: await websiteReviewService.updateWebsiteReview(
        req.params.reviewId,
        req.user.id,
        req.body,
      ),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteWebsiteReview = async (req, res, next) => {
  try {
    await websiteReviewService.deleteWebsiteReview(req.params.reviewId, req.user.id);
    return res.json({ success: true, message: "Website review deleted" });
  } catch (error) {
    return next(error);
  }
};

export const listPendingWebsiteReviews = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Pending website reviews fetched",
      data: await websiteReviewService.listPendingWebsiteReviews(),
    });
  } catch (error) {
    return next(error);
  }
};

export const moderateWebsiteReview = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Website review moderated",
      data: await websiteReviewService.moderateWebsiteReview(req.params.reviewId, req.body.status),
    });
  } catch (error) {
    return next(error);
  }
};
