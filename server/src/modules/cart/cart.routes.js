import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { addCartProductSchema, cartItemParams, updateCartProductSchema } from "./cart.validator.js";
import {
  addCartProductController,
  clearCartController,
  getCartController,
  removeCartProductController,
  updateCartProductController,
} from "./cart.controller.js";

const router = Router();

// 'admin' is included so an administrator account can open the customer area and
// see its own (empty) cart instead of a 403. The data is still scoped to the
// signed-in user id, so this never exposes another customer's cart.
router.use(authMiddleware, roleMiddleware("customer", "admin"));
router.get("/", getCartController);
router.post("/products", validate(addCartProductSchema), addCartProductController);
router.patch(
  "/products/:itemId",
  validateParams(cartItemParams),
  validate(updateCartProductSchema),
  updateCartProductController,
);
router.delete("/products/:itemId", validateParams(cartItemParams), removeCartProductController);
router.delete("/", clearCartController);

export default router;
