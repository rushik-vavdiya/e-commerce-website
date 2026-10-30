import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import WishlistList from './WishlistList';
import PageState from '../common/PageState';
import { addToCart, fetchCart, openCartDrawer } from '../../slices/cartSlice';
import {
  fetchWishlist,
  removeFromWishlist,
} from '../../slices/wishlistSlice';
import { defaultSelection } from '../../utils/variants';
import { getContent } from '../../data/content';
import { fill } from '../../utils/text';

// Wording lives in src/data/siteContent.json under "wishlist.board".
const copy = getContent('wishlist.board', {});

// Data wiring for the wishlist: one implementation shared by the storefront
// wishlist page and the “My wishlist” section inside the profile area. All state
// comes from the existing wishlist, cart and auth slices — nothing is mirrored in
// component state.
export default function WishlistBoard({ compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const { wishlist, loading, error } = useSelector((state) => state.wishlist);
  const cart = useSelector((state) => state.cart.cart);

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!token) return;

    if (wishlist === null) dispatch(fetchWishlist());
    if (cart === null) dispatch(fetchCart());
  }, [dispatch, token, wishlist, cart]);

  const products = useMemo(() => wishlist?.products ?? [], [wishlist]);

  const inCartIds = useMemo(
    () =>
      (cart?.products ?? []).map((item) =>
        String(item?.productId?._id ?? item?.productId),
      ),
    [cart],
  );

  // Take one product out of the saved list.
  const handleRemove = async (productId) => {
    setBusyId(productId);
    setNotice(null);

    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      setNotice({ tone: 'success', text: copy.removed });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  // Move one saved product into the bag.
  const handleMoveToCart = async (product) => {
    setBusyId(product._id);
    setNotice(null);

    // A product with sizes cannot be added without one, so the first size that
    // is in stock is used; the bag line then carries that size and the shopper
    // can change it from the cart or the product page.
    const { combinationId, size } = defaultSelection(product);

    try {
      await dispatch(
        addToCart({ productId: product._id, variantId: combinationId, quantity: 1 }),
      ).unwrap();
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
      setBusyId(null);
      return;
    }

    // The bag now holds the piece, so slide the drawer open to show it.
    dispatch(openCartDrawer());

    // “Move to bag” takes the item out of the saved list, so the wishlist cannot
    // keep a copy of something the customer has already put in the bag. If the
    // cart add worked but the wishlist call failed, say exactly what happened.
    try {
      await dispatch(removeFromWishlist(product._id)).unwrap();
      setNotice({
        tone: 'success',
        text: fill(copy.moved, {
          name: product.name,
          size: size ? fill(copy.movedSize, { size }) : '',
        }),
      });
    } catch (message) {
      setNotice({
        tone: 'error',
        text: fill(copy.moveFailed, {
          name: product.name,
          message: String(message),
        }),
      });
    } finally {
      setBusyId(null);
    }
  };

  if (!token) {
    return (
      <PageState
        title={copy.signInTitle}
        description={copy.signInDescription}
        actionLabel={copy.signInAction}
        onAction={() =>
          navigate('/login', { state: { from: '/wishlist' } })
        }
      />
    );
  }

  return (
    <div className="rv-wishlist-board flex flex-col gap-4">
      {notice && (
        <p
          role={notice.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      <WishlistList
        products={products}
        loading={loading && products.length === 0}
        error={products.length === 0 ? error : null}
        onRemove={handleRemove}
        onMoveToCart={handleMoveToCart}
        busyId={busyId}
        inCartIds={inCartIds}
        compact={compact}
      />
    </div>
  );
}
