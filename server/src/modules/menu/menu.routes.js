import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  getMenuFeatured,
  listMenuCollections,
  updateMenuFeatured,
} from "./menu.controller.js";

const router = Router();

// The featured card is the only part an admin writes to, so it is the only
// route that needs a body schema.
const featuredSchema = z.object({
  eyebrow: z.string().trim().max(60).optional(),
  title: z.string().trim().max(120).optional(),
  buttonLabel: z.string().trim().max(60).optional(),
  href: z
    .string()
    .trim()
    .max(200)
    .regex(/^\/[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/, "Use a site path such as /shop")
    .optional(),
});

router.get("/collections", listMenuCollections);
router.get("/featured", getMenuFeatured);
router.put(
  "/featured",
  authMiddleware,
  roleMiddleware("admin"),
  validate(featuredSchema),
  updateMenuFeatured,
);

export default router;
