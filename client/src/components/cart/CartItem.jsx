import { formatPrice } from '../../utils/format';
import { getContent } from '../../data/content';

// Wording lives in src/data/siteContent.json under "cart.item".
const copy = getContent('cart.item', {});

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) {
  const product = item.productId || {};

  const variant = product.variantCombinations?.find(
    (option) => option._id === item.variantId
  );

  const title = product.name || copy.fallbackTitle;
  const price = variant?.price ?? product.price ?? 0;
  const image = variant?.mainImage || product.mainImage;

  return (
    <article className="flex gap-4 border-b border-border py-5">
      {/* Product Image */}
      <div className="h-28 w-22 shrink-0 overflow-hidden rounded-xl border border-border bg-peach/40">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            {copy.noImage}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-primary">
              {title}
            </h3>

            {variant?.variantName && (
              <p className="mt-1 text-xs text-muted">
                {variant.variantName}
              </p>
            )}

            <p className="mt-2 text-sm font-medium text-accent">
              {formatPrice(price)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRemoveItem(item._id)}
            aria-label={`Remove ${title}`}
            className="shrink-0 text-xs font-medium text-muted underline decoration-border underline-offset-4 transition-colors hover:text-accent"
          >
            {copy.remove}
          </button>
        </div>

        {/* Quantity and Total */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-border bg-background"
            aria-label={copy.quantity}
          >
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(item._id, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
              aria-label={`Decrease ${title} quantity`}
              className="flex h-full w-8 items-center justify-center text-lg text-primary transition-colors hover:bg-peach disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <span className="w-8 text-center text-sm font-semibold text-primary">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(item._id, item.quantity + 1)
              }
              aria-label={`Increase ${title} quantity`}
              className="flex h-full w-8 items-center justify-center text-lg text-primary transition-colors hover:bg-peach"
            >
              +
            </button>
          </div>

          <strong className="text-sm font-bold text-primary">
            {formatPrice(price * item.quantity)}
          </strong>
        </div>
      </div>
    </article>
  );
}