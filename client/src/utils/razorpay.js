import { getContent } from '../data/content';

// Razorpay Checkout is a hosted script, so it is loaded the first time a payment
// is actually started instead of on every page load.
const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let loading = null;

export const loadRazorpayCheckout = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!loading) {
    loading = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => {
        // A failed load should not poison the next attempt.
        loading = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return loading;
};

// Opens the payment window for a payment started by the backend.
//
// The handler only tells this page that the window finished; the payment is
// confirmed afterwards by POST /payments/verify, which checks the signature on
// the server. A cancelled or failed window never marks anything as paid.
export const openRazorpayCheckout = async ({
  payment,
  order,
  prefill = {},
  onSuccess,
  onDismiss,
  onFailure,
}) => {
  const ready = await loadRazorpayCheckout();

  if (!ready) {
    onFailure?.('The payment window could not be loaded. Check your connection and try again.');
    return false;
  }

  const brandName = getContent('brand.name', 'Mahakali');

  const checkout = new window.Razorpay({
    key: payment.keyId,
    amount: payment.amount,
    currency: payment.currency,
    name: brandName,
    description: `Order ${order.orderNumber}`,
    order_id: payment.providerOrderId,
    prefill: {
      name: prefill.name ?? '',
      email: prefill.email ?? '',
      contact: prefill.phone ?? '',
    },
    notes: { orderId: String(order._id) },
    theme: { color: '#7A2E1F' },
    handler: (response) => onSuccess?.(response),
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  });

  checkout.on('payment.failed', (response) => {
    onFailure?.(response?.error?.description || 'The payment did not go through.');
  });

  checkout.open();
  return true;
};
