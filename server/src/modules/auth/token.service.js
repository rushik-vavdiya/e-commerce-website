import jwt from "jsonwebtoken";
import env from "../../config/env.js";

// Short-lived access tokens. Identity comes from the token subject; the
// signature proves the server issued it and the issuer/audience checks keep
// tokens minted for another service from being accepted here.
const ISSUER = process.env.JWT_ISSUER || "mahakali-auth";
const AUDIENCE = process.env.JWT_AUDIENCE || "mahakali-api";

export const generateAccessToken = (user) =>
  jwt.sign(
    { role: user.role },
    env.jwt.accessSecret,
    {
      subject: user._id.toString(),
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: env.jwt.accessExpiresIn || "10m",
      algorithm: "HS256",
    },
  );

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwt.accessSecret, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["HS256"],
  });
