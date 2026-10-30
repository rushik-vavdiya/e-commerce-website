// Notification bus.
//
// The toast list lives in ToastProvider, but toasts are raised from places that
// are not React components at all (for example the axios interceptor that drops
// an expired session). So the message is published on this small bus and the
// provider is the single subscriber that renders it.
//
// Usage from a component:  const toast = useToast(); toast.success('Saved.')
// Usage anywhere else:     notify.error('Your session expired.')

const listeners = new Set();

// A toast is only useful once. Two identical messages inside this window are the
// same event seen twice (a double click, or several requests failing with 401 at
// the same time), not two things to report.
const DUPLICATE_WINDOW_MS = 2000;
const lastSeen = new Map();

export const TOAST_DURATION = {
  success: 5000,
  info: 5000,
  warning: 6000,
  // Errors stay longer: they carry information the person may need to act on.
  error: 8000,
};

let nextId = 0;

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const pushToast = (toast) => {
  const key = `${toast.variant}:${toast.message}`;
  const now = Date.now();
  const seenAt = lastSeen.get(key);

  if (seenAt && now - seenAt < DUPLICATE_WINDOW_MS) {
    return null;
  }

  lastSeen.set(key, now);
  listeners.forEach((listener) => listener(toast));
  return toast.id;
};

const createToast = (variant, message, options = {}) => {
  const text = typeof message === 'string' ? message.trim() : '';
  if (!text) return null;

  return {
    id: `toast-${(nextId += 1)}`,
    variant,
    title: options.title ?? null,
    message: text,
    duration: options.duration ?? TOAST_DURATION[variant] ?? TOAST_DURATION.info,
  };
};

const raise = (variant) => (message, options) => {
  const toast = createToast(variant, message, options);
  if (!toast) return null;
  return pushToast(toast);
};

export const notify = {
  success: raise('success'),
  error: raise('error'),
  warning: raise('warning'),
  info: raise('info'),
};

export default notify;
