import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import validate, { validateParams, validateQuery } from "../../middlewares/validate.middleware.js";
import {
  categoryIdParams,
  categoryImageParams,
  categoryProductsSchema,
  categorySchema,
  categorySearchSchema,
  categoryStatusSchema,
  categoryUpdateSchema,
} from "./category.validator.js";
import {
  createCategoryRecord,
  deleteCategoryImage,
  getCategoryById,
  listCategories,
  removeCategory,
  setCategoryProductsRecord,
  setCategoryStatus,
  updateCategoryRecord,
  uploadCategoryImages,
} from "./category.controller.js";

const router = Router();

router.get("/", validateQuery(categorySearchSchema), optionalAuthMiddleware, listCategories);
router.get(
  "/:categoryId",
  validateParams(categoryIdParams),
  optionalAuthMiddleware,
  getCategoryById,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validate(categorySchema),
  createCategoryRecord,
);
router.put(
  "/:categoryId",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(categoryIdParams),
  validate(categoryUpdateSchema),
  updateCategoryRecord,
);
router.patch(
  "/:categoryId/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(categoryIdParams),
  validate(categoryStatusSchema),
  setCategoryStatus,
);
router.put(
  "/:categoryId/products",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(categoryIdParams),
  validate(categoryProductsSchema),
  setCategoryProductsRecord,
);
router.delete(
  "/:categoryId",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(categoryIdParams),
  removeCategory,
);
router.put(
  "/:categoryId/images",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(categoryIdParams),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  uploadCategoryImages,
);
router.delete(
  "/:categoryId/images/:imageType",
  authMiddleware,
  roleMiddleware("admin"),
  validateParams(categoryImageParams),
  deleteCategoryImage,
);

export default router;
