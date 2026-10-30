import { Link } from 'react-router-dom';
import { Heart, ImageOff, ShoppingBag, Star } from 'lucide-react';

import { discountPercent, formatPrice } from '../../utils/format';
import { productSizes } from '../../utils/variants';

const IMAGE_BADGE = 'left-3 top-3';
const DISCOUNT_BADGE = 'right-3 top-3';

// Reusable product card. Fields match the product document returned by
// GET /products (price, comarePrice, mainImage, ratingAverage, reviewCount,
// variants, variantCombinations).
//
// `actions` is optional. Pass it on listing pages that have Redux wired up:
//   actions={{
//     onAddToCart, onToggleWishlist, inWishlist, inCart,
//     disabled, disabledReason,
//   }}
// `onAddToCart` is called with the product and the id of the first in-stock
// variant combination (null for a product with no variants), so a size travels
// to the cart. The shopper picks a different size on the product page.
//
// Without `actions` the card stays a plain link, which is what the homepage uses.
// `placeholderImage` stands in when a product has no photo of its own yet.
export default function ProductCard({
  product,
  badge,
  actions = null,
  placeholderImage = '',
}) {
  const sizes = productSizes(product);
  const inStockSizes = sizes.filter((size) => size.stock > 0);

  // Sizes are chosen on the product page, not on the card, so the card adds the
  // first size that is actually in stock. A sold-out product has no such size and
  // its button stays disabled.
  const selected = inStockSizes[0] ?? null;

  const discount = discountPercent(product?.price, product?.comarePrice);
  const hasRating = Number(product?.ratingAverage) > 0;

  const productName = product?.name ?? 'this product';
  const href = `/products/${product?._id ?? ''}`;
  const image = product?.mainImage || placeholderImage;

  const soldOut = sizes.length > 0 && inStockSizes.length === 0;
  const canAdd = !soldOut && (!sizes.length || Boolean(selected && selected.stock > 0));

  const addDisabled = actions?.disabled || !canAdd;

  const addReason = actions?.disabled
    ? actions.disabledReason
    : soldOut
      ? `${productName} is out of stock`
      : undefined;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white transition-shadow duration-300 hover:shadow-[0_16px_44px_rgba(122,46,31,0.12)]">
      <div className="relative">
        <Link
          to={href}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block aspect-[2/3] overflow-hidden bg-peach/30"
        >
          {image ? (
            <img
              src={image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
              <ImageOff size={26} strokeWidth={1.5} aria-hidden="true" />
              <span className="text-xs">Image coming soon</span>
            </span>
          )}

          {badge ? (
            <span
              className={`absolute ${IMAGE_BADGE} rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white`}
            >
              {badge}
            </span>
          ) : null}

          {discount ? (
            <span
              className={`absolute ${DISCOUNT_BADGE} rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-white`}
            >
              {discount}% off
            </span>
          ) : null}
        </Link>

        {actions && (
          <button
            type="button"
            onClick={() => actions.onToggleWishlist?.(product)}
            disabled={actions.disabled}
            aria-pressed={Boolean(actions.inWishlist)}
            aria-label={
              actions.inWishlist
                ? `Remove ${productName} from your wishlist`
                : `Save ${productName} to your wishlist`
            }
            title={actions.disabled ? actions.disabledReason : undefined}
            className="absolute bottom-3 right-3 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-sm transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              size={17}
              strokeWidth={1.7}
              aria-hidden="true"
              className={actions.inWishlist ? 'fill-accent text-accent' : ''}
            />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {hasRating && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Star
              size={14}
              strokeWidth={1.6}
              className="fill-accent text-accent"
              aria-hidden="true"
            />
            <span className="font-medium text-primary">
              {Number(product.ratingAverage).toFixed(1)}
            </span>
            <span>({product.reviewCount ?? 0})</span>
          </p>
        )}

        <h3 className="text-sm font-medium leading-6 text-primary">
          <Link
            to={href}
            className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {product?.name ?? 'Untitled product'}
          </Link>
        </h3>

        <p className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-semibold text-primary">
            {formatPrice(product?.price)}
          </span>

          {discount ? (
            <span className="text-sm text-muted line-through">
              {formatPrice(product?.comarePrice)}
            </span>
          ) : null}
        </p>

        {actions && (
          <button
            type="button"
            onClick={() =>
              actions.onAddToCart?.(product, selected?.combination?._id ?? null)
            }
            disabled={addDisabled}
            title={addReason}
            aria-label={
              soldOut
                ? `${productName} is out of stock`
                : `Add ${productName} to your bag`
            }
            className="mt-1 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <ShoppingBag size={15} strokeWidth={1.7} aria-hidden="true" />
            {soldOut ? 'Out of stock' : actions.inCart ? 'In your bag' : 'Add to bag'}
          </button>
        )}
      </div>
    </article>
  );
}
