import { createContext } from 'react';

// Holds the toast helpers the provider builds. Kept in its own module so the
// provider file exports only a component (React Fast Refresh requirement).
const NotificationContext = createContext(null);

export default NotificationContext;
