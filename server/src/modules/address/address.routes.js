import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { addressSchema, addressUpdateSchema } from "./address.validator.js";
import { idParams } from "../../validators/common.validator.js";
import {
  createAddressController,
  deleteAddressController,
  getAddressController,
  getAddressesController,
  updateAddressController,
} from "./address.controller.js";

const router = Router();

// 'admin' is included so an administrator account can use the account area.
// Every query is still filtered by the signed-in user id.
router.use(authMiddleware, roleMiddleware("customer", "admin"));
router.get("/", getAddressesController);
router.get("/:addressId", validateParams(idParams("addressId")), getAddressController);
router.post("/", validate(addressSchema), createAddressController);
router.patch(
  "/:addressId",
  validateParams(idParams("addressId")),
  validate(addressUpdateSchema),
  updateAddressController,
);
router.delete("/:addressId", validateParams(idParams("addressId")), deleteAddressController);

export default router;
