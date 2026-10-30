import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, IndianRupee } from 'lucide-react';

import Button from '../../components/common/Button';
import PageState from '../../components/common/PageState';
import Spinner from '../../components/common/Spinner';
import StatusPill from '../../components/dashboard/StatusPill';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { getContent } from '../../data/content';
import { fetchOrder } from '../../slices/orderSlice';
import { formatDate, formatPrice } from '../../utils/format';
import { statusLabel } from '../../utils/orders';

const copy = getContent('checkout', {});

// /order-success/:orderId — shown after an order is placed. It re-reads the order
// from the API, so it shows the real payment state instead of whatever the
// browser believes.
export default function OrderSuccess() {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { selected, loading, error } = useSelector((state) => state.orders);
  const order = selected && String(selected._id) === String(orderId) ? selected : null;

  useEffect(() => {
    dispatch(fetchOrder(orderId));
  }, [dispatch, orderId]);

  if (!order && loading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
          <Spinner block label="Confirming your order…" />
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
            title="We could not load this order"
            description={error || 'The order may belong to a different account.'}
            actionLabel="Go to my orders"
            onAction={() => window.location.assign('/account/orders')}
          />
        </div>
      </StorefrontLayout>
    );
  }

  const paid = order.paymentStatus === 'paid';
  const cod = order.paymentMethod === 'cod';

  return (
    <StorefrontLayout>
      <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="rounded-3xl border border-border bg-white p-6 text-center sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={30} strokeWidth={1.6} aria-hidden="true" />
          </span>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            {copy.successEyebrow ?? 'Thank you'}
          </p>

          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            {copy.successTitle ?? 'Your order is placed'}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
            {paid
              ? copy.successPaid ??
                'Payment confirmed. We have emailed nothing yet, but the studio can see this order and will start packing it.'
              : cod
                ? copy.successCod ??
                  'Cash on delivery confirmed. Please keep the exact amount ready when the courier arrives.'
                : copy.successPending ??
                  'Your order is saved. The payment is still pending — you can finish it from this order.'}
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            <span className="font-medium text-primary">{order.orderNumber}</span>
            <span className="text-border" aria-hidden="true">·</span>
            <span className="text-muted">{formatDate(order.createdAt)}</span>
            <span className="text-border" aria-hidden="true">·</span>
            <StatusPill value={order.paymentStatus} label={statusLabel(order.paymentStatus)} />
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-white p-5 sm:p-6">
          <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
            Order details
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
              <span className="flex items-center gap-1">
                <IndianRupee size={14} strokeWidth={2} aria-hidden="true" />
                {formatPrice(order.totalAmount).replace('₹', '')}
              </span>
            </div>

            <p className="text-xs text-muted">
              {cod ? 'Payable in cash on delivery.' : paid ? 'Paid online.' : 'Payment pending.'}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4 text-xs leading-5 text-muted">
            <p className="text-sm font-medium text-primary">Delivery address</p>
            <p className="mt-1">
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
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to={`/orders/${order._id}`} className="sm:flex-1">
              <Button variant="primary" size="lg" fullWidth>
                Track this order
              </Button>
            </Link>

            <Link to="/account/orders" className="sm:flex-1">
              <Button variant="outline" size="lg" fullWidth>
                My orders
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
