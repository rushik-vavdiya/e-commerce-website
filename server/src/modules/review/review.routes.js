import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { uploadReviewMedia } from "../../middlewares/upload.middleware.js";
import {
  adminReviewParams,
  productReviewParams,
  reviewIdParams,
  reviewMediaParams,
  reviewModerationSchema,
  reviewSchema,
  reviewUpdateSchema,
} from "./review.validator.js";
import {
  addReviewMedia,
  createReview,
  deleteReview,
  deleteReviewMedia,
  listPendingReviews,
  listReviews,
  moderateReview,
  updateReview,
} from "./review.controller.js";

const router = Router();
router.get("/product/:productId", validateParams(productReviewParams), listReviews);
router.post("/", authMiddleware, roleMiddleware("customer"), validate(reviewSchema), createReview);
router.post(
  "/:reviewId/media",
  authMiddleware,
  roleMiddleware("customer"),
  validateParams(reviewIdParams),
  uploadReviewMedia.array("media", 6),
  addReviewMedia,
);
router.delete(
  "/:reviewId/media/:mediaIndex",
  authMiddleware,
  roleMiddleware("customer"),
  validateParams(reviewMediaParams),
  deleteReviewMedia,
);
router.put(
  "/:reviewId",
  authMiddleware,
  roleMiddleware("customer"),
  validateParams(reviewIdParams),
  validate(reviewUpdateSchema),
  updateReview,
);
router.delete(
  "/:reviewId",
  authMiddleware,
  roleMiddleware("customer", "admin"),
  validateParams(reviewIdParams),
  deleteReview,
);
router.get("/admin/pending", authMiddleware, roleMiddleware("admin"), listPendingReviews);
router.patch(
  "/admin/:reviewId",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(adminReviewParams),
  validate(reviewModerationSchema),
  moderateReview,
);
export default router;
