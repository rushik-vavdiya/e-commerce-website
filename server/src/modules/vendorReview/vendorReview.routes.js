import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { uploadReviewMedia } from "../../middlewares/upload.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import {
  vendorIdParams,
  vendorReviewIdParams,
  vendorReviewMediaParams,
  vendorReviewModerationSchema,
  vendorReviewSchema,
} from "./vendorReview.validator.js";
import {
  addVendorReviewMedia,
  createVendorReview,
  deleteVendorReviewMedia,
  listPendingVendorReviews,
  listVendorReviews,
  moderateVendorReview,
} from "./vendorReview.controller.js";

const router = Router();

router.get("/vendor/:vendorId", validateParams(vendorIdParams), listVendorReviews);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("customer"),
  validate(vendorReviewSchema),
  createVendorReview,
);
router.post(
  "/:reviewId/media",
  authMiddleware,
  roleMiddleware("customer"),
  validateParams(vendorReviewIdParams),
  uploadReviewMedia.array("media", 6),
  addVendorReviewMedia,
);
router.delete(
  "/:reviewId/media/:mediaIndex",
  authMiddleware,
  roleMiddleware("customer"),
  validateParams(vendorReviewMediaParams),
  deleteVendorReviewMedia,
);
router.get("/admin/pending", authMiddleware, roleMiddleware("admin"), listPendingVendorReviews);
router.patch(
  "/admin/:reviewId",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(vendorReviewIdParams),
  validate(vendorReviewModerationSchema),
  moderateVendorReview,
);

export default router;
