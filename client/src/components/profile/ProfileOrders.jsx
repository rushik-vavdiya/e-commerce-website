import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import StatusPill from '../dashboard/StatusPill';
import PageState from '../common/PageState';
import { cancelOrder, fetchOrders } from '../../slices/orderSlice';
import { formatDate, formatPrice } from '../../utils/format';
import { canCancelOrder, statusLabel } from '../../utils/orders';
import { useToast } from '../notifications';

// "My orders": GET /orders with a customer token returns this customer's own
// orders only. The status filter is applied here because the customer list is
// already the full history; cancellation is offered only where the backend still
// allows it (pending/confirmed and unpaid/failed).
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Awaiting payment' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const IN_TRANSIT = ['packed', 'out_for_delivery'];

const matchesFilter = (order, filter) => {
  if (filter === 'all') return true;
  if (filter === 'shipped') return order.orderStatus === 'shipped' || IN_TRANSIT.includes(order.orderStatus);
  return order.orderStatus === filter;
};

export default function ProfileOrders() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.orders);

  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('all');

  const toast = useToast();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleCancel = async (orderId) => {
    setBusyId(orderId);

    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      await dispatch(fetchOrders());
      toast.success('Order cancelled and stock returned.');
    } catch (message) {
      toast.error(String(message));
    } finally {
      setBusyId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-3xl border border-border bg-white/60" />
        ))}
      </div>
    );
  }

  if (error && items.length === 0) {
    return <PageState variant="error" title="We could not load your orders" description={error} />;
  }

  if (items.length === 0) {
    return (
      <PageState
        title="No orders yet"
        description="Once you place an order it appears here with its live status from the backend."
      />
    );
  }

  const visible = items.filter((order) => matchesFilter(order, filter));

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((option) => {
          const count = items.filter((order) => matchesFilter(order, option.id)).length;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={filter === option.id}
              className={[
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                filter === option.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-primary hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              {option.label}
              {count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <PageState
          title="Nothing here yet"
          description="No orders in this state. Try another filter."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((order) => (
            <li key={order._id} className="rounded-3xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-primary">
                    Order {order.orderNumber ? `#${order.orderNumber}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Placed {formatDate(order.createdAt)} · {order.items?.length ?? 0}{' '}
                    {order.items?.length === 1 ? 'item' : 'items'} ·{' '}
                    {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={order.orderStatus} label={statusLabel(order.orderStatus)} />
                  <StatusPill value={order.paymentStatus} label={statusLabel(order.paymentStatus)} />
                </div>
              </div>

              <ul className="mt-4 divide-y divide-border border-y border-border">
                {(order.items ?? []).map((item) => (
                  <li
                    key={item._id ?? `${item.productId}-${item.variantName}`}
                    className="flex items-center gap-3 py-3"
                  >
                    <span className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-peach/30">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1 text-xs text-muted">
                      <span className="block truncate text-sm text-primary">
                        {item.productName}
                        {item.variantName ? ` · ${item.variantName}` : ''}
                      </span>
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>

                    <span className="shrink-0 text-sm font-medium text-primary">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="text-sm text-muted">
                  <p>
                    Total{' '}
                    <span className="font-semibold text-primary">
                      {formatPrice(order.totalAmount)}
                    </span>
                    {order.couponCode ? ` · coupon ${order.couponCode}` : ''}
                  </p>

                  {order.shippingAddress && (
                    <p className="mt-1 text-xs leading-5">
                      Delivering to {order.shippingAddress.fullName},{' '}
                      {order.shippingAddress.addressLine1}, {order.shippingAddress.city}{' '}
                      {order.shippingAddress.postalCode}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-accent"
                  >
                    View details & tracking
                  </Link>

                  {canCancelOrder(order) ? (
                    <button
                      type="button"
                      disabled={busyId === order._id}
                      onClick={() => handleCancel(order._id)}
                      className="inline-flex min-h-9 items-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
                    >
                      {busyId === order._id ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
