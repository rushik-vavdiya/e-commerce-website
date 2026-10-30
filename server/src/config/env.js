import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";

loadEnv({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const otpLength = Number(process.env.OTP_LENGTH) || 6;
if (!Number.isInteger(otpLength) || otpLength < 4 || otpLength > 9) {
  throw new Error("OTP_LENGTH must be a whole number between 4 and 9");
}
const otpExpiresInMinutes = Number(process.env.OTP_EXPIRES_IN_MINUTES) || 10;
if (!Number.isInteger(otpExpiresInMinutes) || otpExpiresInMinutes < 1 || otpExpiresInMinutes > 60) {
  throw new Error("OTP_EXPIRES_IN_MINUTES must be a whole number between 1 and 60");
}

// dotenv already removes a matching pair of quotes, but a stray quote inside a
// value (for example `MAIL_FROM_EMAIL=person@gmail.com"`) stays in the string
// and produces an invalid SMTP envelope, so the code is never delivered. These
// two helpers keep the mail settings to plain values, and only the password
// keeps the characters it was given apart from surrounding whitespace.
const clean = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  const quote = trimmed[0];
  if (trimmed.length > 1 && (quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const cleanToken = (value) =>
  typeof value === "string" ? clean(value).replace(/["']/g, "") : value;

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongoUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "10m",
  },

  // Refresh-token session lifetime and the refresh cookie's SameSite policy.
  // Only raise sameSite to "none" for cross-site frontend/API deployments,
  // which then also requires HTTPS.
  auth: {
    sessionDays: Number(process.env.AUTH_SESSION_DAYS) || 7,
  },
  cookie: {
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
  },

  email: {
    host: cleanToken(process.env.MAIL_HOST),
    port: Number(process.env.MAIL_PORT) || 587,
    secure: cleanToken(process.env.MAIL_SECURE) === "true",
    user: cleanToken(process.env.MAIL_USER),
    password: clean(process.env.MAIL_PASSWORD),
    fromName: cleanToken(process.env.MAIL_FROM_NAME) || "Rynova",
    fromEmail: cleanToken(process.env.MAIL_FROM_EMAIL),
  },

  // Where the contact form sends its notification email. Override it with
  // CONTACT_TO_EMAIL in .env; the default is the studio inbox.
  contact: {
    toEmail: cleanToken(process.env.CONTACT_TO_EMAIL) || "rushikvavdiya0@gmail.com",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  otp: {
    expiresInMinutes: otpExpiresInMinutes,
    length: otpLength,
  },

  security: {
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  rateLimit: {
    authWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900000,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,

    otpWindowMs: Number(process.env.OTP_RATE_LIMIT_WINDOW_MS) || 900000,
    otpMax: Number(process.env.OTP_RATE_LIMIT_MAX) || 5,

    contactWindowMs: Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS) || 900000,
    contactMax: Number(process.env.CONTACT_RATE_LIMIT_MAX) || 5,
  },
};

export default env;
