import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const reviewSchema = z
  .object({
    productId: objectIdSchema,
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().max(120).optional(),
    comment: z.string().trim().max(2000).optional(),
  })
  .strict();
export const reviewUpdateSchema = reviewSchema
  .omit({ productId: true })
  .partial()
  .strict()
  .refine((review) => Object.keys(review).length > 0, "At least one review field is required");
export const reviewModerationSchema = z
  .object({ status: z.enum(["approved", "rejected"]) })
  .strict();
export const productReviewParams = idParams("productId");
export const reviewIdParams = idParams("reviewId");
export const reviewMediaParams = z
  .object({
    reviewId: objectIdSchema,
    mediaIndex: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)),
  })
  .strict();
export const adminReviewParams = idParams("reviewId");
