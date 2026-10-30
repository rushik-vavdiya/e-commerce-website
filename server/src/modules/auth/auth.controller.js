import { AppError } from "../../utils/AppError.js";
import {
  REFRESH_COOKIE_NAME,
  clearSessionCookie,
  setSessionCookie,
} from "./auth.cookies.js";
import {
  changePassword as changePasswordService,
  getCurrentUser,
  registerUser,
  requestPasswordReset,
  resetPassword as resetPasswordService,
  resendVerification as resendVerificationService,
  toSessionUser,
  verifyEmail as verifyEmailService,
  verifyLoginCredentials,
} from "./auth.service.js";
import {
  createLoginSession,
  refreshLoginSession,
  revokeAllUserSessions,
  revokeCurrentSession,
} from "./session.service.js";

export const register = async (req, res, next) => {
  try {
    const { user, verificationEmailSent } = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: verificationEmailSent
        ? "Account created. We emailed you a verification link - click it to activate your account."
        : "Account created, but the verification email could not be sent. Please use the resend button on the verification page.",
      data: toSessionUser(user),
      verificationEmailSent,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await verifyLoginCredentials(req.body);
    const { refreshToken, user: sessionUser, accessToken } = await createLoginSession(user, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    setSessionCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: toSessionUser(sessionUser),
      token: accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) throw new AppError("Refresh session required", 401);

    const { refreshToken, user, accessToken } = await refreshLoginSession(token, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    setSessionCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Session refreshed",
      data: toSessionUser(user),
      token: accessToken,
    });
  } catch (error) {
    clearSessionCookie(res);
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await revokeCurrentSession(req.cookies?.[REFRESH_COOKIE_NAME]);
    clearSessionCookie(res);
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await revokeAllUserSessions(req.user.id);
    clearSessionCookie(res);
    return res.json({ success: true, message: "Logged out from all sessions" });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user.toJSON ? user : user,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    await verifyEmailService(req.body.token);
    return res.json({ success: true, message: "Email verified" });
  } catch (error) {
    return next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    await resendVerificationService(req.body.email);
    return res
      .status(202)
      .json({ success: true, message: "If a verification is pending, a new link has been sent" });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await requestPasswordReset(req.body.email);
    return res
      .status(202)
      .json({ success: true, message: "If this email is registered, a reset link has been sent" });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordService(req.body.token, req.body.newPassword);
    clearSessionCookie(res);
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    // The change revokes every session for the account, including the one
    // that made this request, so the visitor signs in again with the new
    // password everywhere.
    const user = await changePasswordService(req.user.id, req.body.oldPassword, req.body.newPassword);
    clearSessionCookie(res);

    return res.json({
      success: true,
      message: "Password changed successfully. Please sign in again.",
      data: toSessionUser(user),
    });
  } catch (error) {
    return next(error);
  }
};
