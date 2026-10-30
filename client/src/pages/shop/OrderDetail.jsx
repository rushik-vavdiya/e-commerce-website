import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Receipt } from 'lucide-react';

import Button from '../../components/common/Button';
import PageState from '../../components/common/PageState';
import Spinner from '../../components/common/Spinner';
import OrderTracker from '../../components/order/OrderTracker';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { useToast } from '../../components/notifications';
import { getContent } from '../../data/content';
import { cancelOrder, fetchOrder } from '../../slices/orderSlice';
import { confirmPayment, startPayment } from '../../slices/paymentSlice';
import { formatDate, formatPrice } from '../../utils/format';
import { canCancelOrder, canRetryPayment, statusLabel } from '../../utils/orders';
import { openRazorpayCheckout } from '../../utils/razorpay';

const copy = getContent('checkout', {});
const PAYMENT_METHOD_LABELS = {
  razorpay: 'Paid online (Razorpay)',
  cod: 'Cash on delivery',
};

const newKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `key-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// /orders/:orderId — one order, its live status and the timeline behind it.
// The page only ever reads its own order: GET /orders/:id is scoped to the
// signed-in customer on the server.
export default function OrderDetail() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const toast = useToast();

  const { selected, loading, error } = useSelector((state) => state.orders);
  const user = useSelector((state) => state.auth.user);

  const order = selected && String(selected._id) === String(orderId) ? selected : null;

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
  }, [dispatch, orderId]);

  const handleRetryPayment = async () => {
    setBusy(true);
    setActionError(null);

    try {
      // The existing pending order is reused: the backend returns its payment
      // instead of creating a second order for the same items.
      // Thunks resolve to the API envelope; the payment record is in .data.
      const payment = (
        await dispatch(startPayment({ orderId: order._id, idempotencyKey: newKey() })).unwrap()
      ).data;

      const opened = await openRazorpayCheckout({
        payment,
        order,
        prefill: {
          name: order.shippingAddress?.fullName,
          phone: order.shippingAddress?.phone,
          email: user?.email,
        },
        onSuccess: async (response) => {
          try {
            await dispatch(
              confirmPayment({
                orderId: order._id,
                providerOrderId: payment.providerOrderId,
                providerPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            ).unwrap();

            await dispatch(fetchOrder(order._id));
            toast.success('Payment confirmed. Your order is on its way to packing.');
          } catch (verifyError) {
            setActionError(`Payment could not be confirmed: ${verifyError}`);
          } finally {
            setBusy(false);
          }
        },
        onDismiss: () => {
          setBusy(false);
          setActionError('Payment cancelled. You can try again whenever you are ready.');
        },
        onFailure: (message) => {
          setBusy(false);
          setActionError(message);
        },
      });

      if (!opened) setBusy(false);
    } catch (requestError) {
      setActionError(String(requestError));
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    setActionError(null);

    try {
      await dispatch(cancelOrder(order._id)).unwrap();
      await dispatch(fetchOrder(order._id));
      toast.success('Order cancelled. The items went back into stock.');
    } catch (requestError) {
      setActionError(String(requestError));
    } finally {
      setBusy(false);
    }
  };

  if (!order && loading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
          <Spinner block label="Loading your order…" />
        </div>
      </StorefrontLayout>
    );
  }

  if (!order) {
    return (
      <StorefrontLayout>
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
          <PageState
            variant="error"
            title="We could not open this order"
            description={error || 'It may belong to another account.'}
            actionLabel="Back to my orders"
            onAction={() => window.location.assign('/account/orders')}
          />
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto w-full max-w-[1900px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
          All orders
        </Link>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              Order {order.orderNumber}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
              {copy.trackTitle ?? 'Track your order'}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Placed {formatDate(order.createdAt)} · {order.items.length}{' '}
              {order.items.length === 1 ? 'item' : 'items'} · {formatPrice(order.totalAmount)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canRetryPayment(order) && (
              <Button variant="primary" loading={busy} disabled={busy} onClick={handleRetryPayment}>
                <CreditCard size={15} strokeWidth={1.8} aria-hidden="true" />
                Pay now
              </Button>
            )}

            {canCancelOrder(order) && (
              <Button variant="outline" loading={busy} disabled={busy} onClick={handleCancel}>
                Cancel order
              </Button>
            )}
          </div>
        </header>

        {actionError && (
          <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {actionError}
          </p>
        )}

        {/* grid-cols-1 keeps the mobile column at the page width: the horizontal
            tracking rail is wider than a phone, and it must scroll inside its own
            card instead of stretching the page. */}
        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="flex min-w-0 flex-col gap-6">
            <OrderTracker order={order} />

            <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-serif text-xl font-medium tracking-tight text-primary">
                <Receipt size={18} strokeWidth={1.8} aria-hidden="true" />
                Items
              </h2>

              <ul className="mt-4 divide-y divide-border border-y border-border">
                {order.items.map((item) => (
                  <li key={item._id} className="flex items-center gap-4 py-3">
                    <span className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-peach/30">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-primary">{item.productName}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {item.variantName ? `${item.variantName} · ` : ''}
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </span>

                    <span className="text-sm font-medium text-primary">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-primary">{formatPrice(order.subtotalAmount)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Coupon {order.couponCode}</span>
                    <span className="text-green-700">− {formatPrice(order.discountAmount)}</span>
                  </div>
                )}

                <div className="mt-2 flex justify-between border-t border-border pt-3 font-medium text-primary">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-serif text-xl font-medium tracking-tight text-primary">
                <MapPin size={18} strokeWidth={1.8} aria-hidden="true" />
                Delivery address
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted">
                <span className="block font-medium text-primary">
                  {order.shippingAddress?.fullName}
                </span>
                {order.shippingAddress?.addressLine1}
                {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.postalCode}
                <br />
                {order.shippingAddress?.country}
                {order.shippingAddress?.phone ? ` · ${order.shippingAddress.phone}` : ''}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
                Payment
              </h2>

              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Method</dt>
                  <dd className="text-primary">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? 'Online'}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Status</dt>
                  <dd className="text-primary">{statusLabel(order.paymentStatus)}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Amount</dt>
                  <dd className="text-primary">{formatPrice(order.totalAmount)}</dd>
                </div>
              </dl>

              {order.paymentStatus === 'paid' && (
                <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  Payment verified on the server. Keep this order number for any questions.
                </p>
              )}

              {canRetryPayment(order) && (
                <p className="mt-3 text-xs leading-5 text-muted">
                  This order is still waiting for its payment. Nothing has been charged.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
