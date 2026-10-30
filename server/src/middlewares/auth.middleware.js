import env from "../config/env.js";
import { UserRepository } from "../modules/user/user.repository.js";
import { verifyAccessToken } from "../modules/auth/token.service.js";

// Turns the Bearer token into `req.user`, or returns the reason it did not.
// Both middlewares below share this, so the token rules live in one place.
// The token is short-lived; the browser refreshes it through the rotating
// refresh cookie, so rejections here are rare rather than routine.
const readRequestUser = async (req) => {
  const authorization = req.get("authorization");
  if (!authorization) return { status: 401, message: "Authentication required" };

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return { status: 401, message: "Authentication required" };
  }

  if (!env.jwt.accessSecret) {
    return { error: new Error("JWT access secret is not configured") };
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return { status: 401, message: "Invalid or expired access token" };
  }

  const user = await UserRepository.findById(payload.sub).select("role status passwordChangedAt");
  if (!user || user.status !== "active") {
    return { status: 401, message: "Invalid or expired access token" };
  }

  // A password change or reset stamps passwordChangedAt immediately, so any
  // token signed before that moment is retired even though its signature and
  // expiry are still valid. iat counts whole seconds and is truncated
  // downwards, so the comparison can reject a token minted after the change
  // but never one issued afterwards (same-second ties err on the safe side:
  // the token keeps working for its remaining, short lifetime).
  if (user.passwordChangedAt && payload.iat) {
    const changedAtMs = new Date(user.passwordChangedAt).getTime();
    if (changedAtMs > payload.iat * 1000) {
      return { status: 401, message: "Invalid or expired access token" };
    }
  }

  return { user: { id: user._id.toString(), role: user.role } };
};

// Requires a signed-in user. Every route behind this already declares the roles
// it accepts through roleMiddleware.
export const authMiddleware = async (req, res, next) => {
  const { user, status, message, error } = await readRequestUser(req);
  if (error) return next(error);
  if (!user) return res.status(status).json({ success: false, message });

  req.user = user;
  return next();
};

// Same token check, but a request without one is allowed through as a guest.
// Used by the public product and category lists, which show extra rows to an
// administrator or the vendor that owns them.
export const optionalAuthMiddleware = async (req, res, next) => {
  if (!req.get("authorization")) return next();

  const { user, status, message, error } = await readRequestUser(req);
  if (error) return next(error);
  if (!user) return res.status(status).json({ success: false, message });

  req.user = user;
  return next();
};
