import { useCallback, useEffect, useMemo, useState } from 'react';

import NotificationContext from './NotificationContext';
import Toast from './Toast';
import { notify, subscribeToToasts } from '../../utils/notifications';

// Only the newest few are shown at once: a burst of messages should not cover
// the page, and every older toast is on its way out anyway.
const MAX_VISIBLE = 4;

// Renders the notification stack in the top-right corner and hands the same
// `toast` helpers to every child through useToast().
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(
    () =>
      subscribeToToasts((toast) => {
        setToasts((current) => [toast, ...current].slice(0, MAX_VISIBLE));
      }),
    [],
  );

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(
    () => ({ ...notify, dismiss, toasts }),
    [dismiss, toasts],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Pinned to the top-right corner on every screen; `pointer-events-none`
          keeps the empty area from blocking clicks on the page below. */}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,380px)] flex-col sm:right-5 sm:top-5">
        <ul
          aria-live="polite"
          aria-atomic="false"
          aria-label="Notifications"
          className="flex flex-col gap-3"
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </ul>
      </div>
    </NotificationContext.Provider>
  );
}
