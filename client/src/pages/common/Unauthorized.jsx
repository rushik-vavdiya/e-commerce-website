import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldX } from 'lucide-react';

import Button from '../../components/common/Button';
import { logoutUser } from '../../slices/authSlice';
import { roleHomePath } from '../../utils/authHelpers';
import { getContent } from '../../data/content';
import { fill } from '../../utils/text';

// Wording lives in src/data/siteContent.json under "unauthorized".
const copy = getContent('unauthorized', {});

function Unauthorized() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-8 text-center shadow-[0_18px_60px_rgba(122,46,31,0.10)]">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-peach/60 text-accent">
          <ShieldX size={26} aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-2xl font-semibold text-primary">{copy.title}</h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          {copy.description}
          {user?.role ? fill(copy.roleSuffix, { role: user.role }) : ''}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={token && user ? roleHomePath(user.role) : '/'}>
            <Button variant="primary" size="lg" fullWidth>
              {copy.dashboardLabel}
            </Button>
          </Link>

          {token && (
            <Button variant="outline" size="lg" fullWidth onClick={handleLogout}>
              {copy.signOutLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
