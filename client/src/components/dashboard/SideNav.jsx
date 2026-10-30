import { NavLink } from 'react-router-dom';

// Desktop rail shared by the admin, vendor and profile areas. The mobile copy
// of the same links lives in DashboardTopBar.
//
// `base` is the area root (/account, /admin, /vendor). The section paths in
// src/data/dashboardNav.js are relative to it, and they have to be joined here:
// a bare relative <NavLink to="orders"> resolves against the current page, so
// from /account/orders it pointed at /account/orders/orders, matched nothing and
// let the "*" fallback redirect back to the area root. That is why a section
// needed a second click to open.
export default function SideNav({ label, sections = [], footer = null, base = '' }) {
  const hrefFor = (to) => {
    if (!base) return to;
    if (to === '.') return base;
    return `${base}/${to}`;
  };

  return (
    <nav
      aria-label={label}
      className="sticky top-24 hidden h-fit w-60 shrink-0 flex-col gap-1 rounded-3xl border border-border bg-white p-3 lg:flex"
    >
      <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </p>

      <ul className="flex flex-col gap-1">
        {sections.map(({ label: itemLabel, to, end, Icon }) => (
          <li key={itemLabel}>
            <NavLink
              to={hrefFor(to)}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-peach/40 hover:text-accent',
                ].join(' ')
              }
            >
              {Icon && <Icon size={17} strokeWidth={1.8} aria-hidden="true" />}
              <span className="min-w-0 truncate">{itemLabel}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {footer}
    </nav>
  );
}
