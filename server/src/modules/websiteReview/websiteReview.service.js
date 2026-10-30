import { websiteReviewRepository } from "./websiteReview.repository.js";
import { AppError } from "../../utils/AppError.js";

export const createWebsiteReview = async (userId, data) =>
  websiteReviewRepository.create({ ...data, userId });

export const listWebsiteReviews = () => websiteReviewRepository.listApproved();

export const updateWebsiteReview = async (reviewId, userId, data) => {
  const review = await websiteReviewRepository.update(
    reviewId,
    { userId },
    { ...data, status: "pending" },
  );
  if (!review) throw new AppError("Review not found", 404);
  return review;
};

export const deleteWebsiteReview = async (reviewId, userId) => {
  const review = await websiteReviewRepository.delete(reviewId, userId);
  if (!review) throw new AppError("Review not found", 404);
  return review;
};

export const listPendingWebsiteReviews = () => websiteReviewRepository.listPending();

export const moderateWebsiteReview = async (reviewId, status) => {
  const review = await websiteReviewRepository.update(reviewId, {}, { status });
  if (!review) throw new AppError("Review not found", 404);
  return review;
};
