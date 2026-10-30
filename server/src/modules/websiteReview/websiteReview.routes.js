import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import {
  websiteReviewIdParams,
  websiteReviewModerationSchema,
  websiteReviewSchema,
} from "./websiteReview.validator.js";
import {
  createWebsiteReview,
  deleteWebsiteReview,
  listPendingWebsiteReviews,
  listWebsiteReviews,
  moderateWebsiteReview,
  updateWebsiteReview,
} from "./websiteReview.controller.js";

const router = Router();

router.get("/", listWebsiteReviews);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("customer"),
  validate(websiteReviewSchema),
  createWebsiteReview,
);
router.put(
  "/:reviewId",
  authMiddleware,
  roleMiddleware("customer"),
  validateParams(websiteReviewIdParams),
  validate(websiteReviewSchema),
  updateWebsiteReview,
);
router.delete(
  "/:reviewId",
  authMiddleware,
  roleMiddleware("customer"),
  validateParams(websiteReviewIdParams),
  deleteWebsiteReview,
);
router.get("/admin/pending", authMiddleware, roleMiddleware("admin"), listPendingWebsiteReviews);
router.patch(
  "/admin/:reviewId",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(websiteReviewIdParams),
  validate(websiteReviewModerationSchema),
  moderateWebsiteReview,
);

export default router;
