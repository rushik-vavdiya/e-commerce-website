import { Router } from "express";
import validate from "../../middlewares/validate.middleware.js";
import { requireTrustedOrigin } from "../../middlewares/trustedOrigin.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import createRateLimit from "../../middlewares/rateLimit.middleware.js";
import env from "../../config/env.js";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "./auth.controller.js";
import {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validator.js";

const router = Router();

const authLimit = createRateLimit(env.rateLimit.authWindowMs, env.rateLimit.authMax);
// Recovery and verification emails: tighter window, since each hit queues a
// real email for delivery.
const recoveryLimit = createRateLimit(
  env.rateLimit.otpWindowMs,
  env.rateLimit.otpMax,
);

router.post("/register", authLimit, validate(registerSchema), register);
router.post("/login", authLimit, validate(loginSchema), login);
// Cookie-carried endpoints check the request Origin first, so another site
// cannot make the visitor's browser silently drive their refresh cookie — and
// a flood of untrusted calls never consumes the real clients' rate window.
router.post("/refresh", requireTrustedOrigin, authLimit, refresh);
router.post("/logout", requireTrustedOrigin, logout);
router.post("/logout-all", authMiddleware, logoutAll);
router.get("/me", authMiddleware, me);
router.post("/change-password", authMiddleware, validate(changePasswordSchema), changePassword);
router.post("/verify-email", recoveryLimit, validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", recoveryLimit, validate(emailSchema), resendVerification);
router.post("/forgot-password", recoveryLimit, validate(emailSchema), forgotPassword);
router.post("/reset-password", recoveryLimit, validate(resetPasswordSchema), resetPassword);

export default router;
