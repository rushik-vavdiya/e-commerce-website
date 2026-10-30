import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { useContent } from '../../hooks/useSiteContent';
import ProductCard from '../product/ProductCard';
import RowArrows from './RowArrows';
import SectionHeading from './SectionHeading';
import { addToCart, openCartDrawer } from '../../slices/cartSlice';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from '../../slices/wishlistSlice';
import { useToast } from '../notifications';

const ROW_SIZE = 6;

// One row that slides instead of wrapping. It is a plain horizontal scroller with
// CSS scroll-snap — no carousel library — so a swipe, a trackpad, the arrow keys
// and the two arrow buttons all move the same row. Nothing autoplays.
//
// Card widths are fractions of the row minus the gap (gap-4 / sm:gap-5 /
// md:gap-6): one full card on a phone, then 2, 3 and 4 across. Whole cards
// only — the arrows carry the hint that the row keeps going, so no neighbour is
// left half-cropped at the edge.
const CARD_CLASS =
  'w-full shrink-0 snap-start sm:w-[calc(50%-10px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]';

// "New Arrivals": the newest products in the catalog, first page of the products
// slice — which Home loads with sort=newest, so the rows really are the latest
// additions rather than a hand-picked list. The heart and the bag button use the
// same cart and wishlist slices as the shop page, so saving or adding here
// behaves exactly like it does there.
export default function NewArrivals() {
  // Heading text comes from the content slice (seeded from src/data/siteContent.json).
  const heading = useContent('home.newArrivals.heading', {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const { items = [], loading } = useSelector((state) => state.products);
  const cart = useSelector((state) => state.cart.cart);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const token = useSelector((state) => state.auth.token);

  const rows = items.slice(0, ROW_SIZE);

  // The row itself is the slider: its scroll position says whether the arrows
  // still have somewhere to go.
  const trackRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ back: false, forward: false });

  const syncArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    const next = {
      back: track.scrollLeft > 4,
      forward: track.scrollLeft < max - 4,
    };

    // Scrolling fires this on every frame; only re-render when an arrow flips.
    setCanScroll((current) =>
      current.back === next.back && current.forward === next.forward ? current : next,
    );
  }, []);

  // One card per press, gap included, so the arrows land on a card edge.
  const slide = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.firstElementChild;
    const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;

    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  // Wishlist state is only available to a signed-in customer.
  useEffect(() => {
    if (token && wishlist === null) dispatch(fetchWishlist());
  }, [dispatch, token, wishlist]);

  // A resized window changes how many cards overflow, so the arrows re-check.
  useEffect(() => {
    syncArrows();
    window.addEventListener('resize', syncArrows);
    return () => window.removeEventListener('resize', syncArrows);
  }, [syncArrows, rows.length]);

  // Whether the product is already in the saved list.
  const isSaved = (productId) =>
    Boolean(
      wishlist?.products?.some(
        (item) => String(item?._id ?? item) === String(productId),
      ),
    );

  // Whether the product is already in the bag.
  const isInCart = (productId) =>
    Boolean(
      cart?.products?.some(
        (item) =>
          String(item?.productId?._id ?? item?.productId) === String(productId),
      ),
    );

  // Signed-out shoppers are sent to sign in first, then come straight back.
  const requireSignIn = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  // The card passes the first size that is in stock, so a quick add still lands
  // in the bag with a real size attached. No toast here: the drawer opens with
  // its own confirmation line once the add lands.
  const handleAddToCart = (product, variantId = null) => {
    if (!token) return requireSignIn();

    dispatch(addToCart({ productId: product._id, variantId, quantity: 1 }))
      .unwrap()
      .then(() => {
        // The piece is in the bag, so slide the drawer open to show it.
        dispatch(openCartDrawer());
      })
      .catch((message) => toast.error(String(message)));
  };

  // Save the product, or take it back out of the wishlist.
  const handleToggleWishlist = (product) => {
    if (!token) return requireSignIn();

    const saved = isSaved(product._id);

    dispatch(saved ? removeFromWishlist(product._id) : addToWishlist(product._id))
      .unwrap()
      .then(() =>
        toast.success(
          saved
            ? `Removed “${product.name}” from your wishlist.`
            : `Saved “${product.name}” to your wishlist.`,
        ),
      )
      .catch((message) => toast.error(String(message)));
  };

  // Actions handed to each card in the row.
  const actionsFor = (product) => ({
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleWishlist,
    inWishlist: isSaved(product._id),
    inCart: isInCart(product._id),
  });

  if (!loading && rows.length === 0) return null;

  return (
    <section className="rv-new-arrivals w-full bg-background py-12 sm:py-14 lg:py-16">
      <div className="rv-new-arrivals-inner mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10">
        {/* The row's arrows live at the section's top right — one pair, above
            the heading, nudging the same scroll-snap row below. They only show
            once there are cards to move. */}
        {rows.length > 0 && (
          <RowArrows
            label="products"
            className="mb-5"
            onPrev={() => slide(-1)}
            onNext={() => slide(1)}
            canPrev={canScroll.back}
            canNext={canScroll.forward}
          />
        )}

        {/* Copy only: the “View All New In” action from the content store is
            deliberately not rendered — the top-right arrows are the section's
            single control now. */}
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          description={heading.description}
          align={heading.align}
        />

        <div className="mt-8">
          {rows.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-2xl border border-border bg-peach/30"
                />
              ))}
            </div>
          ) : (
            <>
              {/* The row scrolls itself; snap-start keeps every card flush with
                  the left edge once the swipe settles. */}
              <ul
                ref={trackRef}
                onScroll={syncArrows}
                tabIndex={0}
                aria-label="New arrivals"
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden sm:gap-5 md:gap-6"
              >
                {rows.map((product) => (
                  <li key={product._id} className={CARD_CLASS}>
                    <ProductCard product={product} actions={actionsFor(product)} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
