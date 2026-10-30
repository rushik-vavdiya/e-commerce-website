import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import validate, { validateParams, validateQuery } from "../../middlewares/validate.middleware.js";
import {
  productGalleryImageParams,
  productIdParams,
  productQuerySchema,
  productSchema,
  productStatusSchema,
  productUpdateSchema,
  productVariantGalleryParams,
  productVariantParams,
} from "./product.validator.js";
import {
  createProductRecord,
  deleteProductImageController,
  getProductByIdRecord,
  getProductFilters,
  listProducts,
  removeProduct,
  setProductStatus,
  updateProductRecord,
  updateProductImagesController,
} from "./product.controller.js";

const router = Router();

const productImageUpload = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

router.put(
  "/:productId/images",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productIdParams),
  productImageUpload,
  updateProductImagesController,
);
router.delete(
  "/:productId/images/main",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productIdParams),
  deleteProductImageController,
);
router.delete(
  "/:productId/images/gallery/:imageIndex",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productGalleryImageParams),
  deleteProductImageController,
);
router.put(
  "/:productId/variants/:variantId/images",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productVariantParams),
  productImageUpload,
  updateProductImagesController,
);
router.delete(
  "/:productId/variants/:variantId/images/main",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productVariantParams),
  deleteProductImageController,
);
router.delete(
  "/:productId/variants/:variantId/images/gallery/:imageIndex",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productVariantGalleryParams),
  deleteProductImageController,
);

router.get("/", validateQuery(productQuerySchema), optionalAuthMiddleware, listProducts);
// Registered before "/:productId" so "facets" is read as a route, not an id.
router.get("/facets", optionalAuthMiddleware, getProductFilters);
router.get(
  "/:productId",
  validateParams(productIdParams),
  optionalAuthMiddleware,
  getProductByIdRecord,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validate(productSchema),
  createProductRecord,
);
router.put(
  "/:productId",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productIdParams),
  validate(productUpdateSchema),
  updateProductRecord,
);
router.patch(
  "/:productId/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(productIdParams),
  validate(productStatusSchema),
  setProductStatus,
);
router.delete(
  "/:productId",
  authMiddleware,
  roleMiddleware("admin", "vendor"),
  validateParams(productIdParams),
  removeProduct,
);

export default router;
