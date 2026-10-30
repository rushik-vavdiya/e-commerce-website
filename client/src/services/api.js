import axios from 'axios';

import { notify } from '../utils/notifications';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A rejected access token does not sign the visitor out any more: the shared
// HttpOnly refresh cookie mints a replacement, and the failed request replays
// once. Only when that fails (expired session or the cookie was revoked) does
// the browser drop the session.
const isRefreshCall = (config) => Boolean(config?._retriedToken);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const rejectedRequest = error.config;
    const sentToken = Boolean(rejectedRequest?.headers?.Authorization);

    // Only a request that carried this browser's token can mean an expired
    // session. A rejected sign-in (no Authorization header) keeps its own
    // message such as "Invalid credentials".
    if (
      error.response?.status === 401 &&
      sentToken &&
      !isRefreshCall(rejectedRequest) &&
      localStorage.getItem('token')
    ) {
      try {
        // The refresh endpoint reads the cookie, so nothing extra is sent.
        const refreshed = await api.post('/auth/refresh');
        const newToken = refreshed.data?.token;

        if (!newToken) throw new Error('No token in the refresh response');

        localStorage.setItem('token', newToken);
        if (refreshed.data?.data) {
          localStorage.setItem('user', JSON.stringify(refreshed.data.data));
        }

        // Replay the original request on its own interceptor pass (the
        // Authorization update below), marked so a second 401 comes back to
        // the caller instead of looping.
        rejectedRequest._retriedToken = true;
        rejectedRequest.headers.Authorization = `Bearer ${newToken}`;
        return api.request(rejectedRequest);
      } catch {
        // Fall through to the shared session-expired handling.
      }
    }

    if (error.response?.status === 401 && sentToken && localStorage.getItem('token')) {
      const message = 'Your session expired. Please sign in again.';

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:expired'));

      // Says why the session ended instead of silently dropping the user on the
      // sign-in screen. The bus drops repeats from requests failing together.
      notify.error(message);

      // The raw "Invalid or expired access token" is replaced by the same
      // wording, so a caller reporting the failure shows the same sentence and
      // the bus collapses the pair into one notification.
      if (error.response.data) error.response.data.message = message;
    }
    return Promise.reject(error);
  },
);

export default api;
