import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams, validateQuery } from "../../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  orderIdParams,
  orderListQuerySchema,
  orderStatusSchema,
  orderTrackingSchema,
} from "./order.validator.js";
import {
  cancelOrderController,
  createOrderController,
  getOrderController,
  getOrdersController,
  updateOrderStatusController,
  updateOrderTrackingController,
} from "./order.controller.js";

const router = Router();

router.use(authMiddleware);
router.post("/", roleMiddleware("customer"), validate(createOrderSchema), createOrderController);
router.get(
  "/",
  roleMiddleware("customer", "admin"),
  validateQuery(orderListQuerySchema),
  getOrdersController,
);
router.get(
  "/:orderId",
  roleMiddleware("customer", "admin"),
  validateParams(orderIdParams),
  getOrderController,
);
router.post(
  "/:orderId/cancel",
  roleMiddleware("customer", "admin"),
  validateParams(orderIdParams),
  cancelOrderController,
);
router.patch(
  "/:orderId/status",
  roleMiddleware("admin"),
  validateParams(orderIdParams),
  validate(orderStatusSchema),
  updateOrderStatusController,
);
router.patch(
  "/:orderId/tracking",
  roleMiddleware("admin"),
  validateParams(orderIdParams),
  validate(orderTrackingSchema),
  updateOrderTrackingController,
);

export default router;
