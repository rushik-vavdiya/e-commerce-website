import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import Navbar from './Navbar';
import HeaderActions from './HeaderActions';
import MobileMenu from './MobileMenu';
import CartDrawer from '../cart/CartDrawer';

import { getContent, listContent } from '../../data/content';

import {
  changeCartQuantity,
  clearCartNotice,
  closeCartDrawer,
  fetchCart,
  openCartDrawer,
  removeFromCart,
  resetCart,
} from '../../slices/cartSlice';
import { logoutUser } from '../../slices/authSlice';
import { roleHomePath } from '../../utils/authHelpers';

// The navigation links and the brand text come from src/data/siteContent.json
// (keys "nav" and "brand").
const LINKS = listContent('nav.links');
// The one nav entry that opens the department mega menu on hover.
const COLLECTIONS_LABEL = getContent('nav.collectionsLabel') ?? 'Collections';
const BRAND_LOGO = getContent('brand.logoText');
const BRAND_TAGLINE = getContent('brand.tagline');
const LOGO_ARIA_LABEL = getContent('nav.logoAriaLabel');

// Scroll behaviour. The bar stays pinned near the top of the page, hides once the
// shopper is clearly scrolling down, and comes back on the first clear upward
// move. The gaps are hysteresis: a phone's momentum scroll and its address bar
// settling both produce a few 1–2px direction changes, and reacting to those made
// the bar flicker instead of hiding or showing.
const HIDE_AFTER = 72;
const HIDE_STEP = 10;
const SHOW_STEP = 4;


// Render the storefront header, its panels and the cart drawer.
export default function Header({ logo = BRAND_LOGO }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  // Signed in: the icon opens the dashboard for that role (admin area, vendor
  // area or account). Signed out: the sign-in page.
  const accountHref = token && user ? roleHomePath(user.role) : '/login';
  const showAccountMenu = Boolean(token && user?.role === 'customer');
  // A saved profile picture replaces the outline icon in the row, the same way
  // it does in the phone's bottom bar.
  const avatar = user?.profilePicture ?? '';
  const cartState = useSelector((state) => state.cart);
  const cart = cartState.cart;
  // The drawer's open flag lives in the cart slice, so any page that adds an
  // item can slide it open — not just the header's own cart button.
  const cartOpen = cartState.drawerOpen;

  const cartCount =
    cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Close the cart drawer from inside the drawing panel.
  const closeCart = useCallback(() => {
    dispatch(closeCartDrawer());
  }, [dispatch]);

  // Dismiss the drawer's confirmation line once its timer has drained.
  const clearNotice = useCallback(() => {
    dispatch(clearCartNotice());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    } else {
      dispatch(resetCart());
    }
  }, [dispatch, token]);

  useEffect(() => {
    // Close the drawer and clear the session when the token expires.
    const handleExpiredToken = () => {
      dispatch(closeCartDrawer());
      dispatch(logoutUser());
    };

    window.addEventListener('auth:expired', handleExpiredToken);

    return () => {
      window.removeEventListener('auth:expired', handleExpiredToken);
    };
  }, [dispatch]);

  // The mobile menu and the cart are opened from the bar and closed from inside
  // it, so the bar has to stay on screen while either is open. Search needs no
  // panel here: it is its own page (/search) for every screen.
  const panelOpen = menuOpen || cartOpen;

  useEffect(() => {
    // While a panel is open the bar is pinned by `barVisible` (below) and no
    // scroll listener runs. Closing the panel starts a fresh listener, so the
    // bar stays where the shopper left it until they scroll again.
    if (panelOpen) return undefined;

    let lastY = Math.max(0, window.scrollY);
    let frame = 0;

    // Decide whether the bar hides or shows for this frame.
    const update = () => {
      frame = 0;

      // Negative values are the iOS rubber-band overscroll, not a real move.
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;

      if (y <= HIDE_AFTER) {
        lastY = y;
        setHeaderVisible(true);
        return;
      }

      if (delta >= HIDE_STEP) {
        lastY = y;
        setHeaderVisible(false);
      } else if (delta <= -SHOW_STEP) {
        lastY = y;
        setHeaderVisible(true);
      }
    };

    // One layout read per frame, however many scroll events a fling produces.
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [panelOpen]);

  // The bar is also pinned while a panel is open, so its close button can never
  // scroll away with it.
  const barVisible = headerVisible || panelOpen;

  // Open or close the mobile menu and keep the bar visible.
  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    if (next) setHeaderVisible(true);
  };

  // Open the cart drawer, pinning the bar while it is on screen.
  const openCart = () => {
    dispatch(openCartDrawer());
    setHeaderVisible(true);

    if (token && !cart) {
      dispatch(fetchCart());
    }
  };

  return (
    <header
      className={`rv-site-header sticky top-0 z-50 border-b border-border bg-white transition-transform duration-300 ease-in-out ${
        barVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="rv-site-header-bar mx-auto flex max-w-[1900px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4 sm:gap-y-3 sm:px-8 lg:h-[86px] lg:flex-nowrap lg:gap-x-8 lg:px-10">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-peach/40 lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Wordmark lockup: widely tracked Playfair caps carrying a
            plum → maroon → bronze sheen, a hairline-and-diamond flourish
            beneath, then the tracked subtitle. The gradient puts the site's
            palette into the mark itself (flat near-black just read as type),
            and the ornament is the small jewel between name and line that
            fashion-house lockups are built on. The subtitle's trailing
            letter-space is pulled back with a negative end margin so its
            glyphs sit optically centred under the name. */}
        <Link
          to="/"
          aria-label={LOGO_ARIA_LABEL}
          className="group flex shrink-0 flex-col items-center"
        >
          <span className="font-wordmark whitespace-nowrap bg-gradient-to-r from-logo via-primary to-accent bg-clip-text text-[clamp(15px,4.1vw,20px)] font-semibold uppercase leading-none tracking-[0.14em] text-transparent sm:text-[22px] sm:tracking-[0.16em] lg:text-[26px] lg:tracking-[0.18em]">
            {logo}
          </span>

          {/* Two hairlines meeting at a rotated square — the mark's only
              motion: the lines warm up and the diamond turns on hover. */}
          <span
            aria-hidden="true"
            className="mt-[5px] flex items-center gap-1.5 sm:mt-1.5 sm:gap-2"
          >
            <span className="h-px w-5 bg-gradient-to-r from-transparent to-accent/70 transition-colors duration-300 group-hover:to-accent sm:w-8" />
            <span className="size-[5px] rotate-45 bg-accent transition-transform duration-300 group-hover:rotate-[225deg]" />
            <span className="h-px w-5 bg-gradient-to-l from-transparent to-accent/70 transition-colors duration-300 group-hover:to-accent sm:w-8" />
          </span>

          {BRAND_TAGLINE && (
            <span className="mt-[5px] -me-[0.42em] whitespace-nowrap text-[6px] font-medium uppercase leading-none tracking-[0.38em] text-accent transition-colors group-hover:text-primary sm:mt-1.5 sm:text-[8px] sm:tracking-[0.42em]">
              {BRAND_TAGLINE}
            </span>
          )}
        </Link>

        {/* Desktop navigation, centred in the bar. Collections opens the
            department mega menu rather than linking straight to the shop.
            No overflow here: the menu panel is absolutely positioned inside
            this row, and a scroll container would clip it away — the panel was
            invisible while still being in the DOM. The five links fit at the
            lg breakpoint, and the phone layout uses the drawer instead. */}
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <Navbar links={LINKS} collectionsLabel={COLLECTIONS_LABEL} />
        </div>

        <HeaderActions
          cartCount={cartCount}
          accountHref={accountHref}
          showAccountMenu={showAccountMenu}
          avatar={avatar}
          onCartClick={openCart}
        />
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={LINKS}
        collectionsLabel={COLLECTIONS_LABEL}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        cart={cart}
        isAuthenticated={Boolean(token)}
        loading={cartState.loading}
        error={cartState.error}
        notice={cartState.notice}
        onClearNotice={clearNotice}
        onUpdateQuantity={(itemId, quantity) =>
          dispatch(changeCartQuantity({ itemId, quantity }))
        }
        onRemoveItem={(itemId) => dispatch(removeFromCart(itemId))}
        onCheckout={() => {
          closeCart();
          // Checkout needs an account: the address and the order both belong to
          // one, so a signed-out visitor is sent to sign in first.
          navigate(token ? '/checkout' : '/login');
        }}
      />
    </header>
  );
}
