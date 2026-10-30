import { z } from "zod";
import { idParams } from "../../validators/common.validator.js";

export const websiteReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().max(120).optional(),
    comment: z.string().trim().max(2000).optional(),
  })
  .strict();

export const websiteReviewIdParams = idParams("reviewId");
export const websiteReviewModerationSchema = z
  .object({ status: z.enum(["approved", "rejected"]) })
  .strict();
