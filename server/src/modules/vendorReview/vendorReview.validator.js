import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const vendorReviewSchema = z
  .object({
    vendorId: objectIdSchema,
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().max(120).optional(),
    comment: z.string().trim().max(2000).optional(),
  })
  .strict();

export const vendorIdParams = idParams("vendorId");
export const vendorReviewIdParams = idParams("reviewId");
export const vendorReviewModerationSchema = z
  .object({ status: z.enum(["approved", "rejected"]) })
  .strict();
export const vendorReviewMediaParams = z
  .object({
    reviewId: objectIdSchema,
    mediaIndex: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)),
  })
  .strict();
