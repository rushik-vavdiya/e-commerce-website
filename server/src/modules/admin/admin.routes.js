import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { userIdParams, userStatusSchema } from "./admin.validator.js";
import { getDashboard, listUsers, setUserStatus } from "./admin.controller.js";

const router = Router();
router.use(authMiddleware, roleMiddleware("admin"));
router.get("/dashboard", getDashboard);
router.get("/users", listUsers);
router.patch(
  "/users/:userId/status",
  validateParams(userIdParams),
  validate(userStatusSchema),
  setUserStatus,
);
export default router;
