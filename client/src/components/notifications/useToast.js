import { useContext } from 'react';

import NotificationContext from './NotificationContext';

// Any component inside the provider can raise a notification:
//   const toast = useToast();  toast.success('Profile updated.')
// Outside React, use the notify helpers from utils/notifications directly.
const useToast = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }

  return context;
};

export default useToast;
