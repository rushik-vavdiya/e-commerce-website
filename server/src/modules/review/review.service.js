import Order from "../order/order.model.js";
import Product from "../product/product.model.js";
import { reviewRepository } from "./review.repository.js";
import { deleteMedia } from "../../services/cloudinary.service.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { AppError } from "../../utils/AppError.js";

const updateProductRating = async (productId) => {
  const stats = await reviewRepository.ratingStats(productId);
  await Product.findByIdAndUpdate(productId, {
    $set: { ratingAverage: Math.round(stats.average * 100) / 100, reviewCount: stats.count },
  });
};

const verifiedPurchase = async (userId, productId) =>
  Boolean(
    await Order.exists({
      userId,
      orderStatus: "delivered",
      "items.productId": productId,
    }),
  );

export const createReview = async (userId, data) => {
  const product = await Product.findOne({ _id: data.productId, status: "active" });
  if (!product) throw new AppError("Product not found", 404);
  const isVerifiedPurchase = await verifiedPurchase(userId, data.productId);
  if (!isVerifiedPurchase)
    throw new AppError("A delivered order is required to review this product", 400);
  const review = await reviewRepository.create({ ...data, userId, verifiedPurchase: true });
  return review;
};

// Attaches images and/or short videos to a review the caller owns. Each file is
// uploaded to Cloudinary and its url + type is stored on the review.
export const addReviewMedia = async (reviewId, userId, files = []) => {
  if (!files.length) throw new AppError("At least one image or video is required", 400);
  const review = await reviewRepository.findOwned(reviewId, userId);
  if (!review) throw new AppError("Review not found", 404);
  if ((review.media?.length ?? 0) + files.length > 6) {
    throw new AppError("A maximum of 6 media files is allowed", 400);
  }

  const uploaded = [];
  try {
    uploaded.push(...(await uploadToCloudinary(files, { folder: `reviews/${reviewId}` })));
    return await reviewRepository.addMedia(reviewId, userId, uploaded);
  } catch (error) {
    for (const item of uploaded) {
      try {
        await deleteMedia(item.publicId, item.type);
      } catch (cleanupError) {
        console.error("Could not clean up uploaded review media", cleanupError);
      }
    }
    throw error;
  }
};

export const deleteReviewMedia = async (reviewId, userId, mediaIndex) => {
  const review = await reviewRepository.findOwned(reviewId, userId);
  if (!review) throw new AppError("Review not found", 404);
  const item = review.media?.[mediaIndex];
  if (!item) throw new AppError("Review media not found", 404);
  const updated = await reviewRepository.removeMedia(reviewId, userId, item.publicId);
  try {
    await deleteMedia(item.publicId, item.type);
  } catch (error) {
    console.error("Could not delete review media from Cloudinary", error);
  }
  return updated;
};

export const listProductReviews = async (productId) => reviewRepository.listForProduct(productId);

export const updateReview = async (reviewId, userId, data) => {
  const review = await reviewRepository.update(
    reviewId,
    { userId },
    { ...data, status: "pending" },
  );
  if (!review) throw new AppError("Review not found", 404);
  await updateProductRating(review.productId);
  return review;
};

export const deleteReview = async (reviewId, userId, isAdmin = false) => {
  const existing = isAdmin
    ? await reviewRepository.findById(reviewId)
    : await reviewRepository.findOwned(reviewId, userId);
  if (!existing) throw new AppError("Review not found", 404);
  if (isAdmin) await reviewRepository.deleteById(reviewId);
  else await reviewRepository.delete(reviewId, userId);
  await updateProductRating(existing.productId);
};

export const listPendingReviews = () => reviewRepository.listPending();

export const moderateReview = async (reviewId, status) => {
  const review = await reviewRepository.update(reviewId, {}, { status });
  if (!review) throw new AppError("Review not found", 404);
  await updateProductRating(review.productId);
  return review;
};
