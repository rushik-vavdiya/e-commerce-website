// Shared helpers for the authentication flow.
// These mirror the backend contract in server/src/modules/auth/auth.validator.js
// and server/src/config/env.js (OTP_LENGTH / OTP_EXPIRES_IN_MINUTES).

export const OTP_LENGTH = Number(import.meta.env.VITE_OTP_LENGTH) || 6;
export const OTP_EXPIRES_IN_MINUTES =
  Number(import.meta.env.VITE_OTP_EXPIRES_IN_MINUTES) || 10;
const OTP_PATTERN = new RegExp(`^\\d{${OTP_LENGTH}}$`);

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isOtp = (value) => OTP_PATTERN.test(String(value).trim());

// Where each role lands after signing in.
export const roleHomePath = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'vendor') return '/vendor';
  return '/account';
};

export const roleLabel = (role) => {
  if (role === 'admin') return 'Administrator';
  if (role === 'vendor') return 'Vendor';
  return 'Customer';
};
