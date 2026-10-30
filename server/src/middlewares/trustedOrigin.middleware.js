// Cookie-carried endpoints (/auth/refresh, /auth/logout) have no bearer token
// to check, so the request itself has to be trusted instead. A browser always
// sends Origin on these cross-origin vitals calls; if the header names a
// different site, the call is refused. Non-browser clients (tests, curl, cron)
// legitimately omit the header and pass through.
import env from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const isTrustedOrigin = (origin) => {
  if (!origin) return true;

  const normalize = (value) => String(value).replace(/\/$/, "").trim();
  return normalize(origin) === normalize(env.clientUrl);
};

export const requireTrustedOrigin = (req, res, next) => {
  if (!isTrustedOrigin(req.get("origin"))) {
    return res.status(403).json({
      success: false,
      message: "Untrusted request origin",
    });
  }

  return next();
};
