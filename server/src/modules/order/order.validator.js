import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

export const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "partially_refunded",
  "refunded",
];

export const createOrderSchema = z
  .object({
    shippingAddressId: objectIdSchema,
    billingAddressId: objectIdSchema.optional(),
    couponCode: z.string().trim().min(1).max(40).optional(),
    idempotencyKey: z.string().trim().min(8).max(200).optional(),
    // razorpay pays after the order is created; cod confirms it immediately.
    paymentMethod: z.enum(["razorpay", "cod"]).optional(),
  })
  .strict();

export const orderStatusSchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUSES.slice(1)),
  })
  .strict();

export const orderTrackingSchema = z
  .object({
    trackingNumber: z.string().trim().max(100).optional(),
    courierName: z.string().trim().max(100).optional(),
  })
  .strict();

export const orderListQuerySchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    search: z.string().trim().max(80).optional(),
  })
  .passthrough();

export const orderIdParams = idParams("orderId");
