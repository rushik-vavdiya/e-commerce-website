import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const addWishlistProductSchema = z.object({ productId: objectIdSchema }).strict();
export const wishlistProductParams = idParams("productId");
