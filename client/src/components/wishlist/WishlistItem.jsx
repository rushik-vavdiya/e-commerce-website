import { Link } from 'react-router-dom';
import { HeartOff, ImageOff, ShoppingBag, Star } from 'lucide-react';

import Button from '../common/Button';
import { discountPercent, formatPrice } from '../../utils/format';
import { getContent } from '../../data/content';
import { fill } from '../../utils/text';

// Wording lives in src/data/siteContent.json under "wishlist.item".
const copy = getContent('wishlist.item', {});

const isAvailable = (product) =>
  Number(product?.stock ?? 0) > 0 ||
  (product?.variantCombinations ?? []).some((variant) => Number(variant.stock) > 0);

// One saved product. The product document comes from GET /wishlist, which
// populates the products array, so price and stock are the real catalog values.
export default function WishlistItem({
  product,
  onRemove,
  onMoveToCart,
  busy = false,
  inCart = false,
}) {
  const available = isAvailable(product);
  const discount = discountPercent(product?.price, product?.comarePrice);

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:gap-5">
      <Link
        to={`/products/${product._id}`}
        className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-peach/25"
      >
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageOff size={22} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-primary">
          <Link to={`/products/${product._id}`} className="transition-colors hover:text-accent">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-semibold text-primary">
            {formatPrice(product.price)}
          </span>

          {discount ? (
            <>
              <span className="text-sm text-muted line-through">
                {formatPrice(product.comarePrice)}
              </span>
              <span className="rounded-full bg-peach/60 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {fill(copy.off, { percent: discount })}
              </span>
            </>
          ) : null}
        </p>

        <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className={available ? 'text-primary' : 'font-medium text-accent'}>
            {available
              ? fill(copy.inStock, { count: product.stock ?? 0 })
              : copy.outOfStock}
          </span>

          {Number(product.ratingAverage) > 0 && (
            <span className="flex items-center gap-1">
              <Star
                size={13}
                strokeWidth={1.6}
                aria-hidden="true"
                className="fill-accent text-accent"
              />
              {Number(product.ratingAverage).toFixed(1)} ({product.reviewCount ?? 0})
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          loading={busy}
          disabled={busy || !available}
          onClick={() => onMoveToCart?.(product)}
          className="min-h-10 gap-2 rounded-full px-4"
        >
          <ShoppingBag size={15} strokeWidth={1.8} aria-hidden="true" />
          {inCart ? copy.addAgain : copy.moveToBag}
        </Button>

        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove?.(product._id)}
          aria-label={`Remove ${product.name} from your wishlist`}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
        >
          <HeartOff size={15} strokeWidth={1.8} aria-hidden="true" />
          {copy.remove}
        </button>
      </div>
    </article>
  );
}
