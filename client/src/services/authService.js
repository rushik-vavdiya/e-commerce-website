import api from './api';

// POST /auth/login -> { success, message, data: user, token }
export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

// POST /auth/register -> { success, message, data: user } (no token; the account can
// sign in straight away, verifying the email is optional)
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// POST /auth/verify-email -> body { token } (the link the email carried)
export const verifyEmail = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

// POST /auth/resend-verification -> body { email }
export const resendVerification = async (email) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

// POST /auth/forgot-password -> body { email } (always answers 202)
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// POST /auth/reset-password -> body { token, newPassword } (from the reset link)
export const resetPassword = async ({ token, newPassword }) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// POST /auth/change-password -> body { oldPassword, newPassword }
// A successful change revokes the refresh session and retires earlier access
// tokens, so the caller signs the user out.
export const changePassword = async ({ oldPassword, newPassword }) => {
  const response = await api.post('/auth/change-password', { oldPassword, newPassword });
  return response.data;
};

// POST /auth/refresh -> the HttpOnly refresh cookie is the credential; a new
// access token (and a rotated cookie) come back. Kept here next to the other
// auth calls, though the axios interceptor below uses it directly.
export const refreshSession = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

// POST /auth/logout -> requires the bearer token, increments tokenVersion
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
