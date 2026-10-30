import env from "../../config/env.js";

// The refresh token lives in an HttpOnly cookie scoped to the auth routes, so
// JavaScript and cross-route requests never see it and the storefront API
// cannot accidentally ship it to any other endpoint.
const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.cookie?.sameSite || "lax",
  path: "/api/auth",
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
});

const clearSessionCookie = (res) => {
  const options = refreshCookieOptions();
  delete options.maxAge;
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};

const setSessionCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
};

export { REFRESH_COOKIE_NAME, refreshCookieOptions, clearSessionCookie, setSessionCookie };
