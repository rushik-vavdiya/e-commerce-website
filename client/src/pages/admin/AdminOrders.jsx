import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import ProductPagination from '../../components/product/ProductPagination';
import RecentOrders from '../../components/admin/RecentOrders';
import { ADMIN_PAGE_SIZE, clampPage, pageCount, pageSlice } from '../../utils/pagination';
import { fetchAdminUsers } from '../../slices/adminSlice';
import { changeOrderStatus, fetchOrders } from '../../slices/orderSlice';
import { ORDER_STATUS_LABELS } from '../../utils/orders';

// Order management. GET /orders with an admin token returns the newest orders for
// every customer, and accepts the filters below (order number, order status,
// payment status). Status changes use PATCH /orders/:orderId/status and are
// limited to the transitions the backend allows.
const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS)
  .filter(([value]) => ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].includes(value))
  .map(([value, label]) => ({ value, label }));

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'pending', label: 'Payment pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Payment failed' },
  { value: 'partially_refunded', label: 'Partly refunded' },
  { value: 'refunded', label: 'Refunded' },
];

const EMPTY_FILTERS = { search: '', orderStatus: '', paymentStatus: '' };

// Empty values are left out, so an unfiltered list stays a plain GET /orders.
const paramsFor = (filters) => {
  const params = {};
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.orderStatus) params.orderStatus = filters.orderStatus;
  if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
  return params;
};

export default function AdminOrders() {
  const dispatch = useDispatch();

  const orders = useSelector((state) => state.orders);
  const { users } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // The order API returns the filtered set in one go (newest 200), so the
  // table is paged in the browser over whatever the filters matched.
  const pages = pageCount(orders.items.length);
  const activePage = clampPage(page, pages);
  const pageRows = pageSlice(orders.items, activePage);

  // The order rows only carry a user id, so the customer list is used to show a
  // readable name.
  const userById = useMemo(
    () => new Map(users.map((user) => [String(user._id), user])),
    [users],
  );

  const applyFilters = (next) => {
    setFilters(next);
    // A new result set starts again at its first page.
    setPage(1);
    dispatch(fetchOrders(paramsFor(next)));
  };

  const handleStatusChange = async (orderId, orderStatus) => {
    setBusyOrderId(orderId);
    setNotice(null);

    try {
      await dispatch(changeOrderStatus({ orderId, orderStatus })).unwrap();
      await dispatch(fetchOrders(paramsFor(filters))).unwrap();
      setNotice({ tone: 'success', text: `Order moved to ${orderStatus.replace(/_/g, ' ')}.` });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Fulfilment"
        title="Order management"
        description="Search by order number, narrow by status, then open an order to add courier details, move it along or refund a payment. Paid orders must be refunded before they can be cancelled."
      />

      <section className="rounded-3xl border border-border bg-white p-4 sm:p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters(filters);
          }}
          className="flex flex-col gap-3 lg:flex-row lg:items-end"
        >
          <label className="flex w-full flex-col gap-1.5 lg:max-w-xs">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Order number
            </span>

            <span className="relative flex items-center">
              <Search
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="absolute left-3.5 text-muted"
              />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="MHK-…"
                className="min-h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
            </span>
          </label>

          <label className="flex w-full flex-col gap-1.5 lg:w-48">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Order status
            </span>
            <select
              value={filters.orderStatus}
              onChange={(event) => applyFilters({ ...filters, orderStatus: event.target.value })}
              className="min-h-10 rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
            >
              <option value="">All</option>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-full flex-col gap-1.5 lg:w-48">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Payment
            </span>
            <select
              value={filters.paymentStatus}
              onChange={(event) => applyFilters({ ...filters, paymentStatus: event.target.value })}
              className="min-h-10 rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
            >
              <option value="">All</option>
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="min-h-10 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent lg:ml-auto"
          >
            Search
          </button>

          {(filters.search || filters.orderStatus || filters.paymentStatus) && (
            <button
              type="button"
              onClick={() => applyFilters(EMPTY_FILTERS)}
              className="min-h-10 rounded-xl border border-border px-4 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      {notice && (
        <p
          role="status"
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      <RecentOrders
        orders={pageRows}
        loading={orders.loading && orders.items.length === 0}
        error={orders.error}
        userById={userById}
        onStatusChange={handleStatusChange}
        busyOrderId={busyOrderId}
        limit={ADMIN_PAGE_SIZE}
        total={orders.items.length}
        showViewAll={false}
        showManage
      />

      <ProductPagination
        label="Order pages"
        page={activePage}
        pages={pages}
        total={orders.items.length}
        limit={ADMIN_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
