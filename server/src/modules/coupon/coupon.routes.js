import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { couponCodeSchema, couponIdParams, couponSchema } from "./coupon.validator.js";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  validateCoupon,
} from "./coupon.controller.js";

const router = Router();
router.post(
  "/validate",
  authMiddleware,
  roleMiddleware("customer"),
  validate(couponCodeSchema),
  validateCoupon,
);
router.use(authMiddleware, roleMiddleware("admin"));
router.get("/", listCoupons);
router.post("/", validate(couponSchema), createCoupon);
router.put("/:couponId", validateParams(couponIdParams), validate(couponSchema), updateCoupon);
router.delete("/:couponId", validateParams(couponIdParams), deleteCoupon);
export default router;
