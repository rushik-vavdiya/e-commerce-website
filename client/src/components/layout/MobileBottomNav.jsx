import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { House, Search, ShoppingBag, UserRound } from 'lucide-react';

import FallbackImage from '../common/FallbackImage';
import { fetchCart, openCartDrawer } from '../../slices/cartSlice';
import { roleHomePath } from '../../utils/authHelpers';

// The phone-sized bottom bar, in the Instagram style from the design: an icon
// over a short label, the current place held in black (Home fills in when it
// is the current page), the rest muted. Phones get four slots — Home, Search,
// Cart and Profile — and from lg the header takes search and the bag back, so
// the two rows never show the same icons twice.
//
// It floats as a white pill above the page; the layout's own bottom padding
// keeps the footer clear of it, and z-40 keeps it under the cart drawer while
// that drawer is open.
export default function MobileBottomNav() {
  const dispatch = useDispatch();
  const location = useLocation();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.cart);
  const drawerOpen = useSelector((state) => state.cart.drawerOpen);

  const profileHref = token && user ? roleHomePath(user.role) : '/login';

  const cartCount =
    cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;

  const onHome = location.pathname === '/';
  const onSearch = location.pathname.startsWith('/search');
  const onProfile = Boolean(token) && location.pathname.startsWith(profileHref);

  // Same behaviour as the header's bag button: slide the drawer open (the
  // header pins itself while it is open) and make sure the cart is loaded.
  const openCart = () => {
    dispatch(openCartDrawer());

    if (token && !cart) dispatch(fetchCart());
  };

  const itemClass = (active) =>
    [
      'flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-2xl px-1 py-2 transition-colors',
      active ? 'text-primary' : 'text-muted hover:text-accent',
    ].join(' ');

  const labelClass = (active) =>
    `text-[11px] leading-none ${active ? 'font-semibold' : 'font-medium'}`;

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-auto mb-3 w-[calc(100%-24px)] max-w-[440px] rounded-3xl border border-border bg-white px-3 py-1.5 shadow-[0_18px_44px_-18px_rgba(122,46,31,0.45)]">
        <ul className="flex items-stretch justify-between">
          <li className="flex-1">
            <Link
              to="/"
              aria-current={onHome ? 'page' : undefined}
              className={itemClass(onHome)}
            >
              <House
                size={22}
                strokeWidth={1.8}
                aria-hidden="true"
                className={onHome ? 'fill-current' : ''}
              />
              <span className={labelClass(onHome)}>Home</span>
            </Link>
          </li>

          <li className="flex-1">
            <Link
              to="/search"
              aria-current={onSearch ? 'page' : undefined}
              className={itemClass(onSearch)}
            >
              <Search size={22} strokeWidth={1.8} aria-hidden="true" />
              <span className={labelClass(onSearch)}>Search</span>
            </Link>
          </li>

          <li className="flex-1">
            <button
              type="button"
              onClick={openCart}
              aria-label={
                cartCount > 0 ? `Shopping bag, ${cartCount} items` : 'Shopping bag'
              }
              className={itemClass(drawerOpen)}
            >
              <span className="relative">
                <ShoppingBag size={22} strokeWidth={1.8} aria-hidden="true" />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex size-[15px] items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </span>
              <span className={labelClass(drawerOpen)}>Cart</span>
            </button>
          </li>

          <li className="flex-1">
            <Link
              to={profileHref}
              aria-current={onProfile ? 'page' : undefined}
              className={itemClass(onProfile)}
            >
              {user?.profilePicture ? (
                <span className="block size-[22px] overflow-hidden rounded-full ring-1 ring-border">
                  <FallbackImage
                    src={user.profilePicture}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
              ) : (
                <UserRound size={22} strokeWidth={1.8} aria-hidden="true" />
              )}
              <span className={labelClass(onProfile)}>Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
