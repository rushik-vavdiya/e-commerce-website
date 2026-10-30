import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { logoutUser } from '../../slices/authSlice';
import { getContent } from '../../data/content';

// The one line on this screen comes from siteContent ("auth.logout").
const message = getContent('auth.logout.message');

// Visiting /logout clears the session (local + server) and returns home.
function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logoutUser()).finally(() => navigate('/', { replace: true }));
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <span
        className="size-8 animate-spin rounded-full border-2 border-accent border-r-transparent"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-primary">{message}</p>
    </div>
  );
}

export default Logout;
