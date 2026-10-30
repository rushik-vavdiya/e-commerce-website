import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { orderIdParams } from "../order/order.validator.js";
import {
  createPaymentSchema,
  paymentIdParams,
  refundSchema,
  verifyPaymentSchema,
} from "./payment.validator.js";
import {
  createPaymentController,
  getOrderPaymentController,
  refundPaymentController,
  verifyPaymentController,
} from "./payment.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("customer"),
  validate(createPaymentSchema),
  createPaymentController,
);
router.post(
  "/verify",
  authMiddleware,
  roleMiddleware("customer"),
  validate(verifyPaymentSchema),
  verifyPaymentController,
);
router.get(
  "/order/:orderId",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(orderIdParams),
  getOrderPaymentController,
);
router.post(
  "/:paymentId/refund",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(paymentIdParams),
  validate(refundSchema),
  refundPaymentController,
);

export default router;
