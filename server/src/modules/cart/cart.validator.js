import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const addCartProductSchema = z
  .object({
    productId: objectIdSchema,
    variantId: objectIdSchema.nullish(),
    quantity: z.number().int().min(1).max(999).optional(),
  })
  .strict();

export const updateCartProductSchema = z
  .object({
    quantity: z.number().int().min(1).max(999),
  })
  .strict();

export const cartItemParams = idParams("itemId");
