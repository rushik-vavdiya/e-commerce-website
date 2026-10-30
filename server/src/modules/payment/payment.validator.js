import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const createPaymentSchema = z
  .object({
    orderId: objectIdSchema,
    idempotencyKey: z.string().trim().min(8).max(200),
  })
  .strict();

export const verifyPaymentSchema = z
  .object({
    orderId: objectIdSchema,
    providerOrderId: z.string().min(1),
    providerPaymentId: z.string().min(1),
    signature: z.string().min(1),
  })
  .strict();

export const refundSchema = z
  .object({
    amount: z.number().positive().optional(),
  })
  .strict();
export const paymentIdParams = idParams("paymentId");
