import { Link } from 'react-router-dom';

import StatusPill from '../dashboard/StatusPill';
import { formatDate, formatPrice } from '../../utils/format';
import { nextOrderStatuses } from '../../utils/orders';

// Newest orders from GET /orders (the admin token returns every customer's
// orders). `userById` is optional: the order rows only carry a user id, so the
// page can pass the customer list to show a name.
//
// The table scrolls on its own below `lg` instead of squeezing every column, and
// long order numbers (the API allows ids as order numbers) are clipped to one
// line with the full value in the title, so a row never grows to three lines.
export default function RecentOrders({
  orders = [],
  loading = false,
  error = null,
  userById = null,
  onStatusChange,
  busyOrderId = null,
  limit = 8,
  // How many orders exist behind this view. The order management page passes
  // the whole filtered count while handing over one page of rows, so the line
  // still reads "20 of 137" instead of "20 of 20".
  total = null,
  showViewAll = true,
  // The order management page adds a link to the full order screen.
  showManage = false,
}) {
  const rows = orders.slice(0, limit);
  const matched = total ?? orders.length;

  const customerLabel = (order) => {
    const match = userById?.get?.(String(order.userId));
    if (match) {
      const name = `${match.firstName ?? ''} ${match.lastName ?? ''}`.trim();
      if (name) return name;
    }

    return `Account ${String(order.userId ?? '').slice(-6) || 'unknown'}`;
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-medium text-primary">Recent orders</h2>
          <p className="mt-0.5 text-xs text-muted">
            {loading
              ? 'Loading the latest orders…'
              : `${rows.length} of ${matched} orders shown, newest first.`}
          </p>
        </div>

        {showViewAll && (
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-accent transition-colors hover:text-primary"
          >
            View all orders
          </Link>
        )}
      </header>

      {error && (
        <p role="alert" className="px-5 py-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && loading && (
        <div className="flex flex-col gap-2 p-5" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl bg-peach/30" />
          ))}
        </div>
      )}

      {!error && !loading && rows.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted">
          No orders yet. Orders appear here as soon as a customer checks out.
        </p>
      )}

      {!error && !loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="px-5 py-2.5 font-semibold">Order</th>
                <th scope="col" className="px-5 py-2.5 font-semibold">Customer</th>
                <th scope="col" className="px-5 py-2.5 font-semibold">Placed</th>
                <th scope="col" className="px-5 py-2.5 font-semibold">Items</th>
                <th scope="col" className="px-5 py-2.5 font-semibold">Total</th>
                <th scope="col" className="px-5 py-2.5 font-semibold">Payment</th>
                <th scope="col" className="px-5 py-2.5 font-semibold">Status</th>
                <th scope="col" className="px-5 py-2.5 font-semibold">Change status</th>
                {showManage && (
                  <th scope="col" className="px-5 py-2.5 font-semibold">Manage</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map((order) => {
                const options = nextOrderStatuses(order.orderStatus);
                const busy = busyOrderId === order._id;

                return (
                  <tr key={order._id} className="align-middle transition-colors hover:bg-background/60">
                    <td className="max-w-[190px] px-5 py-3">
                      <span
                        title={order.orderNumber ? `#${order.orderNumber}` : undefined}
                        className="block truncate font-medium text-primary"
                      >
                        {order.orderNumber ? `#${order.orderNumber}` : '—'}
                      </span>
                    </td>

                    <td className="max-w-[160px] px-5 py-3">
                      <span
                        title={customerLabel(order)}
                        className="block truncate text-muted"
                      >
                        {customerLabel(order)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 text-muted">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-3 text-muted">{order.items?.length ?? 0}</td>

                    <td className="whitespace-nowrap px-5 py-3 font-medium text-primary">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="px-5 py-3">
                      <StatusPill value={order.paymentStatus} />
                      <span className="mt-1 block text-[11px] text-muted">
                        {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <StatusPill value={order.orderStatus} />
                    </td>

                    <td className="px-5 py-3">
                      {onStatusChange && options.length > 0 ? (
                        <select
                          aria-label={`Change status for order ${String(order.orderNumber ?? '').slice(0, 8)}`}
                          value=""
                          disabled={busy}
                          onChange={(event) =>
                            event.target.value &&
                            onStatusChange(order._id, event.target.value)
                          }
                          className="min-h-9 w-full min-w-[130px] rounded-xl border border-border bg-white px-3 text-xs text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:opacity-50"
                        >
                          <option value="">{busy ? 'Saving…' : 'Set status…'}</option>
                          {options.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-muted">
                          {order.orderStatus === 'cancelled' || order.orderStatus === 'returned'
                            ? 'Final state'
                            : 'No further step'}
                        </span>
                      )}
                    </td>

                    {showManage && (
                      <td className="px-5 py-3">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="whitespace-nowrap text-xs font-semibold text-accent transition-colors hover:text-primary"
                        >
                          Open
                        </Link>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
