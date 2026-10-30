import env from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { sendEmail } from "../../services/email.service.js";
import { UserRepository } from "../user/user.repository.js";
import { createOpaqueToken, hashToken } from "./auth.crypto.js";
import { hashPassword, upgradeLegacyHash, verifyPassword } from "./password.service.js";
import { AuthUserRepository } from "./auth.repository.js";
import { revokeAllUserSessions } from "./session.service.js";

const VERIFICATION_TTL_MINUTES = 30;
const RESET_TTL_MINUTES = 15;

const linkFor = (path, token) =>
  `${String(env.clientUrl).replace(/\/$/, "")}${path}?token=${encodeURIComponent(token)}`;

const sendLinkEmail = ({ to, subject, url, minutes, intro }) =>
  sendEmail({
    to,
    subject,
    text: `${intro}\n\n${url}\n\nThis link expires in ${minutes} minutes. If you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#3a2a25">
  <h2 style="margin:0 0 12px">${subject}</h2>
  <p style="margin:0 0 18px;line-height:1.6">${intro}</p>
  <p style="margin:0 0 18px">
    <a href="${url}" style="background:#a8572f;color:#fff;text-decoration:none;padding:10px 22px;border-radius:999px;font-weight:600">${subject}</a>
  </p>
  <p style="margin:0;font-size:13px;color:#8a756c">Or paste this address into your browser:<br>${url}</p>
  <p style="margin:14px 0 0;font-size:13px;color:#8a756c">This link expires in ${minutes} minutes. If you did not request this, ignore this email.</p>
</div>`,
  });

// The signed-in user object the API responses carry. The model's own JSON
// transform has already stripped the secrets, this just trims to what the
// storefront reads, so profile screens cannot silently break on shape drift.
export const toSessionUser = (user) => {
  const doc = user.toJSON ? user.toJSON() : user;
  return {
    _id: doc._id,
    id: doc._id,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    status: doc.status,
    emailVerified: Boolean(doc.emailVerifiedAt) || doc.emailVerified === true,
    emailVerifiedAt: doc.emailVerifiedAt ?? null,
    profilePicture: doc.profilePicture ?? null,
    createdAt: doc.createdAt,
  };
};

const isEmailVerified = (user) =>
  user.emailVerifiedAt != null || user.emailVerified === true;

export const registerUser = async (input) => {
  const email = String(input.email).trim().toLowerCase();
  const phoneNumber = String(input.phoneNumber).trim();

  const existingUser = await UserRepository.findByEmail(email);
  if (existingUser) throw new AppError("Unable to register with this email", 409);

  const existingPhone = await UserRepository.findByPhone(phoneNumber);
  if (existingPhone) throw new AppError("User with this phone number already exists", 409);

  const verificationToken = createOpaqueToken();
  const user = await AuthUserRepository.createUser({
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    phoneNumber,
    phone: phoneNumber,
    password: await hashPassword(input.password),
    role: "customer",
    status: "active",
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60 * 1000),
  });

  // A failing mail server must not lose the account: keep the data row, tell
  // the visitor the truth, and let /auth/resend-verification try again.
  let verificationEmailSent = true;
  try {
    await sendLinkEmail({
      to: user.email,
      subject: "Verify your email address",
      url: linkFor("/verify-email", verificationToken),
      minutes: VERIFICATION_TTL_MINUTES,
      intro: `Hello ${user.firstName}, verify your email to sign in to Mahakali Kurti House.`,
    });
  } catch (error) {
    verificationEmailSent = false;
    console.error("Verification email could not be sent:", error.message);
  }

  return { user, verificationEmailSent };
};

export const verifyLoginCredentials = async ({ email, password }) => {
  const user = await AuthUserRepository.findUserByEmailWithPassword(email);
  if (!user) throw new AppError("Invalid credentials", 401);

  const { ok, legacy } = await verifyPassword(user.password, password);

  if (!ok || user.status !== "active") {
    throw new AppError("Invalid credentials", 401);
  }

  if (legacy) {
    // First successful sign-in on a bcrypt-era account rewrites the hash to
    // Argon2id, so the account migrates itself.
    await upgradeLegacyHash(user, password);
  }

  if (!isEmailVerified(user)) {
    throw new AppError("Verify your email before logging in", 403);
  }

  return user;
};

export const getCurrentUser = async (userId) => {
  const user = await UserRepository.findById(userId);
  if (!user || user.status !== "active") throw new AppError("User account is unavailable", 401);
  return user;
};

export const verifyEmail = async (token) => {
  const user = await AuthUserRepository.findUserByVerificationHash(hashToken(token));

  if (!user) throw new AppError("Invalid or expired verification link", 400);

  if (isEmailVerified(user)) {
    return user;
  }

  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt <= new Date()) {
    throw new AppError("Invalid or expired verification link", 400);
  }

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
  await AuthUserRepository.saveUser(user);
  return user;
};

export const resendVerification = async (email) => {
  const user = await AuthUserRepository.findUserByEmail(email);
  if (!user || isEmailVerified(user) || user.status !== "active") return;

  const token = createOpaqueToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpiresAt = new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60 * 1000);
  await AuthUserRepository.saveUser(user);

  try {
    await sendLinkEmail({
      to: user.email,
      subject: "Verify your email address",
      url: linkFor("/verify-email", token),
      minutes: VERIFICATION_TTL_MINUTES,
      intro: "Verify your email to sign in to Mahakali Kurti House.",
    });
  } catch (error) {
    // The silent response must not turn into a 5xx just because the inbox
    // failed; the visitor simply tries again later.
    console.error("Verification email could not be sent:", error.message);
    throw new AppError("The verification email could not be sent. Please try again later.", 502);
  }

  return true;
};

export const requestPasswordReset = async (email) => {
  const user = await AuthUserRepository.findUserByEmail(email);
  if (!user || user.status !== "active") return;

  const token = createOpaqueToken();
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
  await AuthUserRepository.saveUser(user);

  try {
    await sendLinkEmail({
      to: user.email,
      subject: "Reset your password",
      url: linkFor("/reset-password/new-password", token),
      minutes: RESET_TTL_MINUTES,
      intro: `Hello ${user.firstName}, here is a link to choose a new password.`,
    });
  } catch (error) {
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await AuthUserRepository.saveUser(user);
    throw new AppError("The reset email could not be sent. Please try again later.", 502);
  }
};

export const resetPassword = async (token, newPassword) => {
  const user = await AuthUserRepository.findUserByResetHash(hashToken(token));

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt <= new Date()) {
    throw new AppError("Invalid or expired reset link", 400);
  }

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await AuthUserRepository.saveUser(user);

  // A password reset is either the attacker or the owner having the inbox —
  // either way every existing session dies.
  await revokeAllUserSessions(user._id);
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await AuthUserRepository.findUserByIdWithPassword(userId);

  if (!user || user.status !== "active") throw new AppError("User not found", 404);

  const { ok } = await verifyPassword(user.password, oldPassword);
  if (!ok) throw new AppError("Old password is incorrect", 400);

  const isSamePassword = await verifyPassword(user.password, newPassword);
  if (isSamePassword.ok) {
    throw new AppError("New password cannot be the same as the old password", 400);
  }

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await AuthUserRepository.saveUser(user);

  await revokeAllUserSessions(user._id);

  return user;
};
