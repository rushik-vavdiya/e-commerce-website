import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import {
  vendorApplicationSchema,
  vendorIdParams,
  vendorReviewSchema,
  vendorStatusSchema,
  vendorUpdateSchema,
} from "./vendor.validator.js";
import {
  applyVendor,
  getPublicVendors,
  getVendorByUserId,
  getVendors,
  reviewVendorApplication,
  setVendorStatusRecord,
  updateVendor,
} from "./vendor.controller.js";

const router = Router();

// Public store directory for the storefront search. Declared before
// authMiddleware on purpose: a signed-out shopper searches stores too.
router.get("/public", getPublicVendors);

router.use(authMiddleware);
router.post("/", roleMiddleware("customer"), validate(vendorApplicationSchema), applyVendor);
router.get("/me", roleMiddleware("customer", "vendor"), getVendorByUserId);
router.patch("/me", roleMiddleware("vendor"), validate(vendorUpdateSchema), updateVendor);
router.get("/", roleMiddleware("admin"), getVendors);
router.patch(
  "/:vendorId/review",
  roleMiddleware("admin"),
  validateParams(vendorIdParams),
  validate(vendorReviewSchema),
  reviewVendorApplication,
);
router.patch(
  "/:vendorId/status",
  roleMiddleware("admin"),
  validateParams(vendorIdParams),
  validate(vendorStatusSchema),
  setVendorStatusRecord,
);

export default router;
