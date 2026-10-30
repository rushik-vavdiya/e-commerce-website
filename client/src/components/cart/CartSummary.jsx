
import { formatPrice } from '../../utils/format';
import { getContent } from '../../data/content';

// Wording lives in src/data/siteContent.json under "cart.summary".
const copy = getContent('cart.summary', {});

export default function CartSummary({ subtotal, onCheckout }) {
  return (
    <div className="border-t border-border bg-background px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-primary">
          {copy.subtotal}
        </span>

        <strong className="text-lg font-bold text-primary">
          {formatPrice(subtotal)}
        </strong>
      </div>

      <p className="mt-2 text-xs leading-5 text-muted">
        {copy.note}
      </p>

      {onCheckout && (
        <button
          type="button"
          onClick={onCheckout}
          className="mt-4 w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {copy.checkout}
        </button>
      )}
    </div>
  );
}
