
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";

import Spinner from "../common/Spinner";
import CartEmpty from "./CartEmpty";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { getContent } from "../../data/content";

// Wording lives in src/data/siteContent.json under "cart.drawer".
const copy = getContent("cart.drawer", {});

// How long the confirmation stays before it drains away.
const NOTICE_MS = 3200;

// The drawer confirms a completed change with its own banner — no corner toast
// and no "updating" line while the request is still in flight.
const NOTICE_TEXT = {
  added: copy.added,
  updated: copy.updated,
  removed: copy.removed,
};

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  isAuthenticated = true,
  loading = false,
  error = null,
  notice = null,
  onClearNotice,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  const items = cart?.products || [];

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = items.reduce((total, item) => {
    const product = item.productId || {};

    const variant = product.variantCombinations?.find(
      (option) => option._id === item.variantId
    );

    return (
      total +
      (variant?.price ?? product.price ?? 0) * item.quantity
    );
  }, 0);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  // Each confirmation gets its own lifetime; a newer change restarts the clock.
  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => onClearNotice?.(), NOTICE_MS);

    return () => window.clearTimeout(timer);
  }, [notice, onClearNotice]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label={copy.closeLabel}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 h-full w-full bg-scrim/55 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal={isOpen}
        aria-label={copy.title}
        inert={!isOpen}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-border bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-peach/60 px-5 py-5 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
              {copy.title}

              <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-white">
                {itemCount}
              </span>
            </h2>

            <p className="mt-1 text-sm text-muted">
              {copy.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeLabel}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X
              className="size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Confirmation: raised once a cart change lands, then drains away. */}
        {notice && (
          <div
            key={notice.seq}
            role="status"
            className="shrink-0 overflow-hidden border-b border-accent/25 bg-gradient-to-r from-peach/80 via-peach/45 to-background motion-safe:animate-pop"
          >
            <div className="flex items-center gap-2.5 px-5 py-3 sm:px-6">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_2px_8px_rgba(169,100,58,0.4)]">
                <Check size={13} strokeWidth={3} aria-hidden="true" />
              </span>

              <p className="min-w-0 text-sm font-medium text-primary">
                {NOTICE_TEXT[notice.kind] ?? copy.updated}
              </p>
            </div>

            {/* Drains over the same lifetime as the timer above, so the bar
                is an honest countdown to the banner disappearing. */}
            <span
              aria-hidden="true"
              className="block h-0.5 w-full origin-left animate-toast-progress bg-accent/70"
              style={{ animationDuration: `${NOTICE_MS}ms` }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && isAuthenticated && (
          <p
            role="alert"
            className="mx-5 mt-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 sm:mx-6"
          >
            {error}
          </p>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6">
          {loading && !cart ? (
            <Spinner block label={copy.loading} />
          ) : items.length === 0 ? (
            <CartEmpty
              onClose={onClose}
              isAuthenticated={isAuthenticated}
            />
          ) : (
            items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
              />
            ))
          )}
        </div>

        {/* Cart Summary */}
        {items.length > 0 && (
          <CartSummary
            subtotal={subtotal}
            onCheckout={onCheckout}
          />
        )}
      </aside>
    </div>,
    document.body
  );
}
