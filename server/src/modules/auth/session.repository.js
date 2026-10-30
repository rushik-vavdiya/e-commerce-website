// The one place the Session collection is touched, the same way UserRepository
// is the one place the User collection is touched.
import Session from "./session.model.js";

export const SessionRepository = {
  createSession: (data) => Session.create(data),

  findSessionByTokenHash: (hash) =>
    Session.findOne({ refreshTokenHash: hash }).select("+refreshTokenHash +replacedByTokenHash"),

  findSessionByTokenHashIncludingRevoked: (hash) =>
    Session.findOne({ refreshTokenHash: hash }).select(
      "+refreshTokenHash +replacedByTokenHash",
    ),

  // Consumes the presented token: marks it revoked with a pointer to its
  // successor. Must be called after the successor row was created, so a
  // concurrent reuse revocation can still see and revoke the successor.
  rotateSessionToken: ({ sessionId, oldHash, newHash, expiresAt }) =>
    Session.findOneAndUpdate(
      {
        _id: sessionId,
        refreshTokenHash: oldHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { revokedAt: new Date(), replacedByTokenHash: newHash } },
      { returnDocument: "after" },
    ),

  revokeSessionFamily: (familyId) =>
    Session.updateMany(
      { familyId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    ),

  revokeAllUserSessions: (userId) =>
    Session.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    ),

  deleteSessionById: (sessionId) => Session.findByIdAndDelete(sessionId),
};
