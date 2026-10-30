import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

import PageState from '../common/PageState';
import WishlistItem from './WishlistItem';
import { getContent } from '../../data/content';
import { fill } from '../../utils/text';

// Wording lives in src/data/siteContent.json under "wishlist.list".
const copy = getContent('wishlist.list', {});

// Renders GET /wishlist rows. The wishlist document holds populated product
// objects, so `wishlist.products` is what is drawn here.
export default function WishlistList({
  products = [],
  loading = false,
  error = null,
  onRemove,
  onMoveToCart,
  busyId = null,
  inCartIds = [],
  compact = false,
}) {
  const navigate = useNavigate();

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading wishlist">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-border bg-white/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <PageState
        variant="error"
        title={copy.loadError}
        description={error}
      />
    );
  }

  if (products.length === 0) {
    return (
      <PageState
        title={copy.emptyTitle}
        description={copy.emptyDescription}
        actionLabel={copy.emptyAction}
        onAction={() => navigate('/shop')}
      />
    );
  }

  return (
    <div className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
      {products.map((product) => (
        <WishlistItem
          key={product._id}
          product={product}
          onRemove={onRemove}
          onMoveToCart={onMoveToCart}
          busy={busyId === product._id}
          inCart={inCartIds.includes(String(product._id))}
        />
      ))}

      <p className="flex items-center gap-2 text-xs text-muted">
        <Heart size={14} strokeWidth={1.8} aria-hidden="true" className="text-accent" />
        {fill(products.length === 1 ? copy.savedOne : copy.savedMany, {
          count: products.length,
        })}
      </p>
    </div>
  );
}
