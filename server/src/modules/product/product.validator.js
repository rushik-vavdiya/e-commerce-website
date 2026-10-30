import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

const specification = z
  .object({ key: z.string().trim().min(1).max(100), value: z.string().trim().min(1).max(500) })
  .strict();
const variant = z
  .object({
    name: z.string().trim().min(1).max(100),
    options: z.array(z.string().trim().min(1).max(100)).min(1).max(50),
  })
  .strict();
const combination = z
  .object({
    // An existing combination keeps its _id across edits so its uploaded images
    // stay attached. New combinations simply omit it.
    _id: objectIdSchema.optional(),
    variantName: z.string().trim().min(1).max(200),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    sku: z.string().trim().max(100).optional(),
    comarePrice: z.number().nonnegative().optional(),
  })
  .strict();

export const productSchema = z
  .object({
    vendorId: objectIdSchema.optional(),
    name: z.string().trim().min(2).max(200),
    description: z.string().trim().min(1).max(10000),
    price: z.number().nonnegative(),
    comarePrice: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative(),
    weight: z.number().nonnegative().optional(),
    dimensions: z
      .object({
        length: z.number().nonnegative().optional(),
        width: z.number().nonnegative().optional(),
        height: z.number().nonnegative().optional(),
      })
      .strict()
      .optional(),
    sku: z.string().trim().max(100).optional(),
    categoryId: objectIdSchema,
    // Extra categories the product also belongs to. Same value as an update.
    categoryIds: z.array(objectIdSchema).max(20).optional(),
    status: z.enum(["active", "draft"]).optional(),
    productSpecifications: z.array(specification).max(100).optional(),
    variants: z.array(variant).max(10).optional(),
    variantCombinations: z.array(combination).max(100).optional(),
  })
  .strict();

// Update keeps the create shape but every field is optional, so a partial
// edit can change just the name or the price. The controller only keeps the
// editable fields that were actually sent.
export const productUpdateSchema = productSchema.partial();

// PATCH /products/:id/status only carries the status itself.
export const productStatusSchema = z
  .object({
    status: z.enum(["active", "draft"]),
  })
  .strict();

// URL params. The gallery index arrives as a string in the URL and the
// repository needs an integer, so it is coerced here.
export const productIdParams = idParams("productId");

const imageIndexSchema = z.coerce.number().int().min(0);

export const productGalleryImageParams = z
  .object({
    productId: objectIdSchema,
    imageIndex: imageIndexSchema,
  })
  .strict();

export const productVariantParams = z
  .object({
    productId: objectIdSchema,
    variantId: objectIdSchema,
  })
  .strict();

export const productVariantGalleryParams = z
  .object({
    productId: objectIdSchema,
    variantId: objectIdSchema,
    imageIndex: imageIndexSchema,
  })
  .strict();

// GET /products filters. Every value arrives as a string from the URL, so the
// numbers are coerced and the enums are checked here; the controller receives a
// ready-to-use filter object. Unknown keys are dropped rather than rejected.
export const productQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    categoryId: objectIdSchema.optional(),
    vendorId: objectIdSchema.optional(),
    status: z.enum(["active", "draft"]).optional(),
    name: z.string().trim().optional(),
    availability: z.enum(["all", "available", "unavailable"]).optional(),
    variant: z.string().trim().optional(),
    // Multi-select size and colour filters: comma-separated values the
    // repository matches against whole segments of "Colour / Size" names.
    sizes: z.string().trim().optional(),
    colors: z.string().trim().optional(),
    sort: z
      .enum([
        "az",
        "a-to-z",
        "za",
        "z-to-a",
        "price-low-high",
        "low-to-high",
        "price-high-low",
        "high-to-low",
        "newest",
        "new-to-old",
        "oldest",
        "old-to-new",
      ])
      .optional(),
    hasVariants: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strip()
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    { message: "minPrice must not be greater than maxPrice", path: ["minPrice"] },
  );
