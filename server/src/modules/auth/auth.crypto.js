import { createHash, randomBytes, randomUUID } from "node:crypto";

// Refresh tokens and email-action tokens are 256-bit opaque strings. Only
// their SHA-256 hash is stored, so a database dump cannot mint working
// sessions or verification links.
export const createOpaqueToken = () => randomBytes(32).toString("base64url");

export const hashToken = (token) => createHash("sha256").update(token).digest("hex");

// Every refresh-token rotation keeps one family id, so a whole device's
// sessions can be revoked together when a reuse attack is detected.
export const createTokenFamilyId = () => randomUUID();
