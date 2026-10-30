import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, LogOut, Menu, Store, X } from 'lucide-react';

import StatusPill from './StatusPill';
import { logoutUser } from '../../slices/authSlice';
import { roleLabel } from '../../utils/authHelpers';
import { getContent } from '../../data/content';

// The mark above the area label comes from the same content file as the
// storefront header, so a brand rename never leaves a dashboard behind.
const brandName = getContent('brand.logoText');

// Header shared by the admin, vendor and profile areas: brand mark, the mobile
// copy of the sidebar navigation, and a profile menu with sign out.
// `base` is the area root (/admin, /vendor). The section paths are relative to
// it, and joining them here is what stops a section link from resolving against
// the page you are already on — see the note in SideNav.jsx.
export default function DashboardTopBar({ areaLabel, sections = [], base = '' }) {
  const hrefFor = (to) => {
    if (!base) return to;
    if (to === '.') return base;
    return `${base}/${to}`;
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const fullName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Signed-in user';
  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() ||
    'U';

  // Close the profile menu on an outside click or Escape.
  useEffect(() => {
    const handleClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1900px] items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
            aria-expanded={menuOpen}
            className="inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-peach lg:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* The mark is the storefront lockup at dashboard scale: the same
              Playfair caps with the plum→bronze sheen the storefront header uses,
              so the two areas read as one brand. It links back to the area's own
              home — a dashboard logo that drops you on the storefront is a dead
              end for the person using it. */}
          <Link
            to={base || '/'}
            aria-label={`${brandName} — ${areaLabel.toLowerCase()} home`}
            className="group flex min-w-0 flex-col text-primary"
          >
            <span className="font-wordmark whitespace-nowrap bg-gradient-to-r from-logo via-primary to-accent bg-clip-text text-[17px] font-semibold uppercase leading-none tracking-[0.14em] text-transparent transition-opacity group-hover:opacity-80 sm:text-[20px] sm:tracking-[0.16em]">
              {brandName}
            </span>

            {/* The storefront's hairline-and-diamond flourish, shrunk to fit
                above the area label. */}
            <span aria-hidden="true" className="mt-[3px] flex items-center gap-1">
              <span className="h-px w-3 bg-gradient-to-r from-transparent to-accent/70" />
              <span className="size-[3px] rotate-45 bg-accent transition-transform duration-300 group-hover:rotate-[225deg]" />
              <span className="h-px w-3 bg-gradient-to-l from-transparent to-accent/70" />
            </span>

            <span className="mt-[3px] -me-[0.3em] truncate text-[7px] font-medium uppercase leading-none tracking-[0.3em] text-accent">
              {areaLabel}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="hidden items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            <Store size={15} strokeWidth={1.8} aria-hidden="true" />
            Storefront
          </Link>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-full border border-border bg-white px-2.5 py-2 text-primary transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-3"
            >
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-full bg-peach/70 text-[11px] font-semibold text-primary"
              >
                {initials}
              </span>

              <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                {fullName}
              </span>

              <ChevronDown
                size={15}
                strokeWidth={1.9}
                aria-hidden="true"
                className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-[0_18px_50px_-20px_rgba(122,46,31,0.35)]">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium text-primary">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-muted">{user?.email}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusPill
                      value={user?.role}
                      label={roleLabel(user?.role)}
                      tone="accent"
                    />
                    <StatusPill value={user?.status} />
                  </div>
                </div>

                <div className="my-1 h-px bg-border" aria-hidden="true" />

                <Link
                  to="/"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-primary transition-colors hover:bg-peach/40"
                >
                  <Store size={16} strokeWidth={1.8} aria-hidden="true" />
                  Go to storefront
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-accent transition-colors hover:bg-peach/40"
                >
                  <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Dashboard sections"
          className="border-t border-border bg-background px-4 pb-4 sm:px-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1 py-3">
            {sections.map(({ label, to, end, Icon }) => (
              <li key={label}>
                <NavLink
                  to={hrefFor(to)}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-primary hover:bg-peach/40',
                    ].join(' ')
                  }
                >
                  {Icon && <Icon size={17} strokeWidth={1.8} aria-hidden="true" />}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
