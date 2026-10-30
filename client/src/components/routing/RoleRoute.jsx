import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logoutUser } from '../../slices/authSlice';

// Wraps routes that need a signed-in user, optionally limited to some roles.
// Example: <RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>
//
// An administrator is treated as a super-user: it is the role that already owns
// every management screen, and it may also open the customer and vendor areas so
// one account can inspect the whole site. This is only the route guard — every
// request is still authorised again by the backend for the signed-in role.
export default function RoleRoute({ allowedRoles = [], children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // The axios response interceptor fires "auth:expired" when the access
  // token is rejected, so protected pages drop the session too.
  useEffect(() => {
    const handleExpiredToken = () => {
      dispatch(logoutUser());
    };

    window.addEventListener('auth:expired', handleExpiredToken);

    return () => {
      window.removeEventListener('auth:expired', handleExpiredToken);
    };
  }, [dispatch]);

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const isSuperUser = user.role === 'admin';

  if (!isSuperUser && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
