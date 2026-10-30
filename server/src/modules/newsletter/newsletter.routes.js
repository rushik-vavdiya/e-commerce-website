import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { listSubscribers, subscribe } from "./newsletter.controller.js";
import { newsletterSubscribeSchema } from "./newsletter.validator.js";

const router = Router();

router.post("/subscribe", validate(newsletterSubscribeSchema), subscribe);
router.get("/subscribers", authMiddleware, roleMiddleware("admin"), listSubscribers);

export default router;
