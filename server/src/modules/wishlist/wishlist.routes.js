import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { addWishlistProductSchema, wishlistProductParams } from "./wishlist.validator.js";
import {
  addWishlistProductController,
  getWishlistController,
  removeWishlistProductController,
} from "./wishlist.controller.js";

const router = Router();

// 'admin' is included for the same reason as the cart: a super-user account can
// open the customer area, and the list stays scoped to its own user id.
router.use(authMiddleware, roleMiddleware("customer", "admin"));
router.get("/", getWishlistController);
router.post("/products", validate(addWishlistProductSchema), addWishlistProductController);
router.delete(
  "/products/:productId",
  validateParams(wishlistProductParams),
  removeWishlistProductController,
);

export default router;
