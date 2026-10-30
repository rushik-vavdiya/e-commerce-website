import env from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { UserRepository } from "../user/user.repository.js";
import { createOpaqueToken, createTokenFamilyId, hashToken } from "./auth.crypto.js";
import { generateAccessToken } from "./token.service.js";
import { SessionRepository } from "./session.repository.js";

// A signed-in visitor holds one rotating refresh token in an HttpOnly cookie
// (same lifetime) plus a short access JWT in memory/localStorage. Every
// rotation rewrites both.
const SESSION_TTL_MS = (env.auth?.sessionDays || 7) * 24 * 60 * 60 * 1000;

// Successor grace: when two tabs share one cookie jar, both may hit /refresh
// with the same old cookie around the same moment. The loser finds its token
// already rotated; if the winner's successor session is still fresh and
// active, we rotate that one instead of calling it theft — which is exactly
// what it is not.
const SUCCESSOR_GRACE_MS = 30 * 1000;

const sessionExpiry = () => new Date(Date.now() + SESSION_TTL_MS);

export const createLoginSession = async (user, metadata = {}) => {
  const refreshToken = createOpaqueToken();

  await SessionRepository.createSession({
    userId: user._id,
    familyId: createTokenFamilyId(),
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: sessionExpiry(),
    userAgent: metadata.userAgent?.slice(0, 500),
    ipAddress: metadata.ipAddress?.slice(0, 100),
  });

  return { refreshToken, expiresAt: sessionExpiry(), user, accessToken: generateAccessToken(user) };
};

// Rotates the presented token. Returns { refreshToken, user } on success or
// throws 401 so the controller can clear the cookie and answer normally.
export const refreshLoginSession = async (rawToken, metadata = {}) => {
  const oldHash = hashToken(rawToken);
  const existing = await SessionRepository.findSessionByTokenHashIncludingRevoked(oldHash);

  if (!existing) throw new AppError("Invalid or expired session", 401);

  const now = new Date();

  // A revoked token with a fresh successor is a concurrent same-device
  // refresh, not reuse. Anything else revoked means the family was replayed.
  if (existing.revokedAt) {
    const successor = existing.replacedByTokenHash
      ? await SessionRepository.findSessionByTokenHash(existing.replacedByTokenHash)
      : null;

    const successorIsFresh =
      successor &&
      !successor.revokedAt &&
      successor.expiresAt > now &&
      now - existing.revokedAt <= SUCCESSOR_GRACE_MS;

    if (!successorIsFresh) {
      await SessionRepository.revokeSessionFamily(existing.familyId);
      throw new AppError("Invalid or expired session", 401);
    }

    // Continue rotating from the successor as naturally as possible.
    return rotateSuccessor(successor, metadata);
  }

  if (existing.expiresAt <= now) {
    await SessionRepository.revokeSessionFamily(existing.familyId);
    throw new AppError("Invalid or expired session", 401);
  }

  const user = await UserRepository.findById(existing.userId);
  if (!user || user.status !== "active") {
    await SessionRepository.revokeSessionFamily(existing.familyId);
    throw new AppError("Invalid or expired session", 401);
  }

  return rotateSession(existing, user, metadata);
};

const rotateSession = async (session, user, metadata) => {
  const nextToken = createOpaqueToken();
  const nextHash = hashToken(nextToken);

  // The successor row is created first, then the old token is consumed, so a
  // concurrent reuse-triggered family revocation can still see and revoke
  // the successor too.
  const created = await SessionRepository.createSession({
    userId: user._id,
    familyId: session.familyId,
    refreshTokenHash: nextHash,
    expiresAt: sessionExpiry(),
    userAgent: metadata.userAgent?.slice(0, 500),
    ipAddress: metadata.ipAddress?.slice(0, 100),
  });

  const rotated = await SessionRepository.rotateSessionToken({
    sessionId: session._id,
    oldHash: session.refreshTokenHash,
    newHash: nextHash,
    expiresAt: session.expiresAt,
  });

  if (!rotated) {
    await SessionRepository.revokeSessionFamily(session.familyId);
    await SessionRepository.deleteSessionById(created._id);
    throw new AppError("Invalid or expired session", 401);
  }

  return { refreshToken: nextToken, user, accessToken: generateAccessToken(user) };
};

const rotateSuccessor = async (successor, metadata) => {
  const user = await UserRepository.findById(successor.userId);
  if (!user || user.status !== "active") {
    await SessionRepository.revokeSessionFamily(successor.familyId);
    throw new AppError("Invalid or expired session", 401);
  }

  return rotateSession(successor, user, metadata);
};

// Revokes the family of the presented cookie; a missing cookie is fine —
// logout is idempotent so a stale browser cannot hang on clearing state.
export const revokeCurrentSession = async (rawToken) => {
  if (!rawToken) return;

  const session = await SessionRepository.findSessionByTokenHashIncludingRevoked(
    hashToken(rawToken),
  );
  if (session) await SessionRepository.revokeSessionFamily(session.familyId);
};

export const revokeAllUserSessions = (userId) => SessionRepository.revokeAllUserSessions(userId);
