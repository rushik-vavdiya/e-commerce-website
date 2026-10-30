import { Router } from "express";
import {
  changeUserStatus,
  deleteProfilePicture,
  deleteUser,
  getProfilePicture,
  getme,
  updateMe,
  updateProfilePicture,
} from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { updateUserSchema, userIdParams, userStatusSchema } from "./user.validator.js";

const router = Router();

router.use(authMiddleware);
router.get("/me", getme);
router.patch("/me", validate(updateUserSchema), updateMe);
router.get("/me/profile-picture", getProfilePicture);
router.put("/me/profile-picture", upload.single("image"), updateProfilePicture);
router.delete("/me/profile-picture", deleteProfilePicture);
router.delete("/me", deleteUser);
router.patch(
  "/:userId/status",
  roleMiddleware("admin"),
  validateParams(userIdParams),
  validate(userStatusSchema),
  changeUserStatus,
);

export default router;
