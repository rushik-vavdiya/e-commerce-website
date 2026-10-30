import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const categorySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().min(1).max(1000),
    parentCategoryId: objectIdSchema.nullable().optional(),
    level: z.number().int().min(0).optional(),
    status: z.enum(["active", "draft"]).optional(),
  })
  .strict();

export const categoryUpdateSchema = categorySchema
  .partial()
  .refine(
    (category) => Object.keys(category).length > 0,
    "At least one category field is required",
  );

export const categoryStatusSchema = z.object({ status: z.enum(["active", "draft"]) }).strict();

// The admin picker sends the full set of products that should be listed in the
// category, not a diff, so unchecking a product removes it.
export const categoryProductsSchema = z
  .object({ productIds: z.array(objectIdSchema).max(500) })
  .strict();
export const categoryIdParams = idParams("categoryId");
export const categoryImageParams = z
  .object({
    categoryId: objectIdSchema,
    imageType: z.enum(["image", "banner"]),
  })
  .strict();
export const categorySearchSchema = z
  .object({ search: z.string().max(100).optional() })
  .passthrough();
