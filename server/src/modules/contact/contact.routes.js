import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateQuery } from "../../middlewares/validate.middleware.js";
import createRateLimit from "../../middlewares/rateLimit.middleware.js";
import env from "../../config/env.js";
import { createContact, listContacts } from "./contact.controller.js";
import { contactListQuerySchema, contactMessageSchema } from "./contact.validator.js";

const router = Router();

// Anyone can send a message; the limit keeps one browser from flooding the inbox.
const contactLimit = createRateLimit(env.rateLimit.contactWindowMs, env.rateLimit.contactMax);

router.post("/", contactLimit, validate(contactMessageSchema), createContact);

// The messages carry names and email addresses, so only an admin can read them.
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validateQuery(contactListQuerySchema),
  listContacts,
);

export default router;
