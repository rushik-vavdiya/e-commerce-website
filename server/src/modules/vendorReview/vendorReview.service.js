import Order from "../order/order.model.js";
import Product from "../product/product.model.js";
import Vendor from "../vendor/vendor.model.js";
import { deleteMedia } from "../../services/cloudinary.service.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { vendorReviewRepository } from "./vendorReview.repository.js";
import { AppError } from "../../utils/AppError.js";

// A review counts as a verified purchase when the customer has a delivered order
// that contains one of this vendor's products.
const verifiedPurchase = async (userId, vendorId) => {
  const productIds = await Product.find({ vendorId }).distinct("_id");
  if (productIds.length === 0) return false;
  return Boolean(
    await Order.exists({
      userId,
      orderStatus: "delivered",
      "items.productId": { $in: productIds },
    }),
  );
};

export const createVendorReview = async (userId, data) => {
  const vendor = await Vendor.findById(data.vendorId);
  if (!vendor) throw new AppError("Vendor not found", 404);
  const isVerified = await verifiedPurchase(userId, data.vendorId);
  return vendorReviewRepository.create({ ...data, userId, verifiedPurchase: isVerified });
};

export const listVendorReviews = async (vendorId) => vendorReviewRepository.listForVendor(vendorId);

export const addVendorReviewMedia = async (reviewId, userId, files = []) => {
  if (!files.length) throw new AppError("At least one image or video is required", 400);
  const review = await vendorReviewRepository.findOwned(reviewId, userId);
  if (!review) throw new AppError("Review not found", 404);
  if ((review.media?.length ?? 0) + files.length > 6) {
    throw new AppError("A maximum of 6 media files is allowed", 400);
  }

  const uploaded = [];
  try {
    uploaded.push(...(await uploadToCloudinary(files, { folder: `vendor-reviews/${reviewId}` })));
    return await vendorReviewRepository.addMedia(reviewId, userId, uploaded);
  } catch (error) {
    for (const item of uploaded) {
      try {
        await deleteMedia(item.publicId, item.type);
      } catch (cleanupError) {
        console.error("Could not clean up uploaded vendor review media", cleanupError);
      }
    }
    throw error;
  }
};

export const deleteVendorReviewMedia = async (reviewId, userId, mediaIndex) => {
  const review = await vendorReviewRepository.findOwned(reviewId, userId);
  if (!review) throw new AppError("Review not found", 404);
  const item = review.media?.[mediaIndex];
  if (!item) throw new AppError("Review media not found", 404);
  const updated = await vendorReviewRepository.removeMedia(reviewId, userId, item.publicId);
  try {
    await deleteMedia(item.publicId, item.type);
  } catch (error) {
    console.error("Could not delete vendor review media from Cloudinary", error);
  }
  return updated;
};

export const listPendingVendorReviews = () => vendorReviewRepository.listPending();

export const moderateVendorReview = async (reviewId, status) => {
  const review = await vendorReviewRepository.update(reviewId, {}, { status });
  if (!review) throw new AppError("Review not found", 404);
  return review;
};
