import * as vendorReviewService from "./vendorReview.service.js";

export const createVendorReview = async (req, res, next) => {
  try {
    return res.status(201).json({
      success: true,
      message: "Vendor review submitted for moderation",
      data: await vendorReviewService.createVendorReview(req.user.id, req.body),
    });
  } catch (error) {
    return next(error);
  }
};

export const listVendorReviews = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Vendor reviews fetched",
      data: await vendorReviewService.listVendorReviews(req.params.vendorId),
    });
  } catch (error) {
    return next(error);
  }
};

export const addVendorReviewMedia = async (req, res, next) => {
  try {
    return res.status(201).json({
      success: true,
      message: "Vendor review media added",
      data: await vendorReviewService.addVendorReviewMedia(
        req.params.reviewId,
        req.user.id,
        req.files ?? [],
      ),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteVendorReviewMedia = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Vendor review media removed",
      data: await vendorReviewService.deleteVendorReviewMedia(
        req.params.reviewId,
        req.user.id,
        req.params.mediaIndex,
      ),
    });
  } catch (error) {
    return next(error);
  }
};

export const listPendingVendorReviews = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Pending vendor reviews fetched",
      data: await vendorReviewService.listPendingVendorReviews(),
    });
  } catch (error) {
    return next(error);
  }
};

export const moderateVendorReview = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Vendor review moderated",
      data: await vendorReviewService.moderateVendorReview(req.params.reviewId, req.body.status),
    });
  } catch (error) {
    return next(error);
  }
};
