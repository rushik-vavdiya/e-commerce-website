import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, UserRound } from 'lucide-react';

import FallbackImage from '../common/FallbackImage';

// The icon row on the right of the header. Search is a page now (/search) —
// same for every screen — so its icon is a plain link; the inline panel is
// gone. On phones the search and bag slots are hidden because the fixed bottom
// bar owns those two controls there, while the account control stays at every
// width: its menu holds the shortcuts (profile, review, logout) that the
// desktop-only account sidebar cannot offer a phone. The wishlist is still a
// real page (/wishlist); it just does not take a header slot.
const ICON_BUTTON =
  'relative inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-peach/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

// A saved profile picture stands in for the outline person icon — the same
// circular avatar the bottom bar shows — and the plain icon covers accounts
// that never added one.
function ProfileGlyph({ avatar }) {
  if (!avatar) return <UserRound size={20} strokeWidth={1.7} aria-hidden="true" />;

  return (
    <span className="block size-7 overflow-hidden rounded-full ring-1 ring-border">
      <FallbackImage src={avatar} alt="" className="h-full w-full object-cover" />
    </span>
  );
}

function IconButton({ label, href, onClick, children, badge = 0 }) {
  const content = (
    <>
      {children}

      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={ICON_BUTTON}>
        {content}
      </button>
    );
  }

  return (
    <Link to={href} aria-label={label} className={ICON_BUTTON}>
      {content}
    </Link>
  );
}

// The signed-in customer's menu: profile, review and logout.
function AccountMenu({ avatar }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="My account"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={ICON_BUTTON}
      >
        <ProfileGlyph avatar={avatar} />
      </button>

      <div
        className={`absolute right-0 top-full z-50 min-w-40 pt-2 ${
          open ? 'block' : 'hidden group-hover:block group-focus-within:block'
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-lg">
          <Link
            to="/account/profile"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background hover:text-accent"
          >
            Profile
          </Link>
          {/* The account sidebar is desktop-only, so the review form needs this
              entry to be reachable on a phone. */}
          <Link
            to="/account/review"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background hover:text-accent"
          >
            Write a review
          </Link>
          <Link
            to="/logout"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background hover:text-accent"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HeaderActions({
  cartCount = 0,
  onCartClick,
  accountHref = '/login',
  showAccountMenu = false,
  avatar = '',
}) {
  return (
    <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-0 sm:gap-2">
      {/* Search and the bag only appear from lg — on phones the bottom bar
          carries them instead of the header repeating itself. The visibility
          sits on a wrapper: `.hidden` loses to a display utility on the same
          element, so the icon button itself keeps only its own classes. */}
      <span className="hidden lg:inline-flex">
        <IconButton label="Search" href="/search">
          <Search size={20} strokeWidth={1.7} />
        </IconButton>
      </span>

      {showAccountMenu ? (
        <AccountMenu avatar={avatar} />
      ) : (
        <IconButton label="My account" href={accountHref}>
          <ProfileGlyph avatar={avatar} />
        </IconButton>
      )}

      <span className="hidden lg:inline-flex">
        <IconButton
          label="Shopping bag"
          onClick={onCartClick}
          badge={cartCount}
        >
          <ShoppingBag size={20} strokeWidth={1.7} />
        </IconButton>
      </span>
    </div>
  );
}
