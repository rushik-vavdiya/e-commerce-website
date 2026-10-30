import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, RefreshCw, Truck } from 'lucide-react';

import Button from '../../components/common/Button';
import PageState from '../../components/common/PageState';
import Spinner from '../../components/common/Spinner';
import OrderTracker from '../../components/order/OrderTracker';
import StatusPill from '../../components/dashboard/StatusPill';
import { useToast } from '../../components/notifications';
import { fetchAdminUsers } from '../../slices/adminSlice';
import { changeOrderStatus, fetchOrder, updateOrderTracking } from '../../slices/orderSlice';
import { fetchOrderPayment, requestRefund } from '../../slices/paymentSlice';
import { formatDate, formatDateTime, formatPrice } from '../../utils/format';
import { nextOrderStatuses, statusLabel } from '../../utils/orders';

const PAYMENT_METHOD_LABELS = {
  razorpay: 'Razorpay (online)',
  cod: 'Cash on delivery',
};

const REFUND_LABELS = {
  none: 'No refund requested',
  pending: 'Refund pending',
  processed: 'Refund processed',
  failed: 'Refund failed',
};

// Courier fields start from the saved values. The form is mounted once per order
// (see the key below), so no effect has to copy the order into local state.
function TrackingForm({ order, busy, onSave }) {
  const [values, setValues] = useState({
    trackingNumber: order.trackingNumber ?? '',
    courierName: order.courierName ?? '',
  });

  const change = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          trackingNumber: values.trackingNumber.trim(),
          courierName: values.courierName.trim(),
        });
      }}
      className="mt-4 flex flex-col gap-3"
    >
      <div>
        <label htmlFor="admin-courier" className="block text-xs font-medium text-primary">
          Courier
        </label>
        <input
          id="admin-courier"
          type="text"
          value={values.courierName}
          onChange={change('courierName')}
          placeholder="For example: Blue Dart"
          className="mt-1.5 min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </div>

      <div>
        <label htmlFor="admin-tracking" className="block text-xs font-medium text-primary">
          Tracking number
        </label>
        <input
          id="admin-tracking"
          type="text"
          value={values.trackingNumber}
          onChange={change('trackingNumber')}
          placeholder="AWB or docket number"
          className="mt-1.5 min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </div>

      <Button type="submit" variant="secondary" loading={busy} disabled={busy}>
        <Truck size={15} strokeWidth={1.8} aria-hidden="true" />
        Save courier details
      </Button>
    </form>
  );
}

// /admin/orders/:orderId — one order with everything the studio needs: customer,
// address, items, payment references, status steps, courier details and refunds.
// Every action below is authorised again on the server.
export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { selected, loading, error } = useSelector((state) => state.orders);
  const users = useSelector((state) => state.admin.users);
  const storedPayment = useSelector((state) => state.payments.orderPayment);

  const order = selected && String(selected._id) === String(orderId) ? selected : null;
  const payment =
    storedPayment && String(storedPayment.orderId) === String(orderId) ? storedPayment : null;

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
    dispatch(fetchAdminUsers());
    dispatch(fetchOrderPayment(orderId));
  }, [dispatch, orderId]);

  const customer = users.find((user) => String(user._id) === String(order?.userId));

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    if (!nextStatus) return;

    setBusy(true);
    setNotice(null);

    try {
      await dispatch(changeOrderStatus({ orderId, orderStatus: nextStatus })).unwrap();
      await dispatch(fetchOrder(orderId));
      toast.success(`Order moved to ${statusLabel(nextStatus)}.`);
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
  };

  const handleTrackingSave = async (values) => {
    setBusy(true);
    setNotice(null);

    try {
      await dispatch(updateOrderTracking({ orderId, ...values })).unwrap();

      toast.success('Courier details saved.');
      setNotice({ tone: 'success', text: 'Courier details saved.' });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
  };

  const handleRefund = async () => {
    if (!payment?._id) return;

    setBusy(true);
    setNotice(null);

    try {
      await dispatch(requestRefund({ paymentId: payment._id })).unwrap();
      dispatch(fetchOrderPayment(orderId));
      await dispatch(fetchOrder(orderId));
      toast.success('Refund requested. It is marked processed once the provider confirms.');
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
  };

  if (!order && loading) {
    return (
      <Spinner block label="Loading order…" />
    );
  }

  if (!order) {
    return (
      <PageState
        variant="error"
        title="Order not found"
        description={error || 'This order may have been removed.'}
        actionLabel="Back to orders"
        onAction={() => navigate('/admin/orders')}
      />
    );
  }

  const options = nextOrderStatuses(order.orderStatus);
  const canRefund =
    payment &&
    ['captured', 'partially_refunded'].includes(payment.status) &&
    payment.refundStatus !== 'pending';

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
        All orders
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-border bg-white p-5 sm:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Order {order.orderNumber}
          </p>
          <h1 className="mt-2 font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
            {formatPrice(order.totalAmount)} · {order.items.length}{' '}
            {order.items.length === 1 ? 'item' : 'items'}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Placed {formatDate(order.createdAt)} · {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? 'Online'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill value={order.orderStatus} label={statusLabel(order.orderStatus)} />
          <StatusPill value={order.paymentStatus} label={statusLabel(order.paymentStatus)} />
        </div>
      </header>

      {notice && (
        <p
          role="status"
          className={[
            'rounded-2xl border px-4 py-3 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="flex min-w-0 flex-col gap-6">
          <OrderTracker order={order} />

          <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
            <h2 className="text-base font-medium text-primary">Items</h2>

            <ul className="mt-3 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item._id} className="flex items-center gap-3 py-3">
                  <span className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-peach/30">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                    ) : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-primary">{item.productName}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {item.variantName ? `${item.variantName} · ` : ''}
                      {item.quantity} × {formatPrice(item.unitPrice)}
                      {item.vendorId ? ` · vendor ${String(item.vendorId).slice(-6)}` : ''}
                    </span>
                  </span>

                  <span className="text-sm font-medium text-primary">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-primary">{formatPrice(order.subtotalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Coupon {order.couponCode}</span>
                  <span className="text-primary">− {formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-primary">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-border bg-white p-5">
            <h2 className="text-base font-medium text-primary">Customer</h2>

            <p className="mt-2 text-sm text-primary">
              {customer ? `${customer.firstName} ${customer.lastName}` : 'Account customer'}
            </p>
            <p className="text-xs text-muted">{customer?.email ?? String(order.userId)}</p>

            <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Delivery address
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              {order.shippingAddress?.fullName}
              <br />
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

          <section className="rounded-3xl border border-border bg-white p-5">
            <h2 className="text-base font-medium text-primary">Fulfilment</h2>

            <label htmlFor="admin-order-status" className="mt-3 block text-xs font-medium text-primary">
              Move order to
            </label>
            <select
              id="admin-order-status"
              value=""
              onChange={handleStatusChange}
              disabled={busy || options.length === 0}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:opacity-50"
            >
              <option value="">{options.length ? 'Choose next step…' : 'No further step'}</option>
              {options.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>

            <TrackingForm key={order._id} order={order} busy={busy} onSave={handleTrackingSave} />
          </section>

          <section className="rounded-3xl border border-border bg-white p-5">
            <h2 className="text-base font-medium text-primary">Payment</h2>

            {payment ? (
              <dl className="mt-2 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Status</dt>
                  <dd className="text-primary">{statusLabel(payment.status)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Amount</dt>
                  <dd className="text-primary">{formatPrice(payment.amount)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Razorpay order</dt>
                  <dd className="break-all text-right text-primary">{payment.providerOrderId ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Razorpay payment</dt>
                  <dd className="break-all text-right text-primary">{payment.providerPaymentId ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Refund</dt>
                  <dd className="text-primary">{REFUND_LABELS[payment.refundStatus] ?? '—'}</dd>
                </div>
                {payment.refundedAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Refunded at</dt>
                    <dd className="text-primary">{formatDateTime(payment.refundedAt)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-2 text-xs text-muted">
                {order.paymentMethod === 'cod'
                  ? 'Cash on delivery — no online payment record.'
                  : 'No payment has been started for this order yet.'}
              </p>
            )}

            {canRefund && (
              <Button
                variant="outline"
                className="mt-4"
                loading={busy}
                disabled={busy}
                onClick={handleRefund}
              >
                <RefreshCw size={15} strokeWidth={1.8} aria-hidden="true" />
                Refund {formatPrice(payment.amount - payment.refundedAmount)}
              </Button>
            )}

            {payment?.refundStatus === 'pending' && (
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-muted">
                <IndianRupee size={12} strokeWidth={2} aria-hidden="true" className="mt-0.5" />
                Refund requested. The status updates when Razorpay confirms it through the webhook.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
