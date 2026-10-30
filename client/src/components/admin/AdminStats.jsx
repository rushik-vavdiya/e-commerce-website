import {
  BadgeIndianRupee,
  Boxes,
  ClipboardList,
  Package,
  ShieldCheck,
  Store,
  Tags,
  Users,
} from 'lucide-react';

import StatCard from '../dashboard/StatCard';
import { formatPrice } from '../../utils/format';

// Counts come straight from GET /admin/dashboard. The endpoint has no revenue
// aggregate, so the order-value card explains exactly which rows it covers.
export default function AdminStats({ stats, orders = [], loading = false }) {
  const orderValue = orders.reduce(
    (total, order) =>
      order.paymentStatus === 'refunded' || order.orderStatus === 'cancelled'
        ? total
        : total + Number(order.totalAmount || 0),
    0,
  );

  const cards = [
    {
      label: 'All accounts',
      value: stats?.users,
      Icon: Users,
      caption: 'Every account: customers, vendors and admins.',
    },
    {
      label: 'Vendors',
      value: stats?.vendors,
      Icon: Store,
      caption: `${stats?.pendingVendors ?? 0} waiting for approval.`,
    },
    {
      label: 'Products',
      value: stats?.products,
      Icon: Package,
      caption: `${stats?.pendingProducts ?? 0} in draft.`,
    },
    {
      label: 'Orders',
      value: stats?.orders,
      Icon: ClipboardList,
      caption: 'Orders created on the storefront.',
    },
    {
      label: 'Categories',
      value: stats?.categories,
      Icon: Tags,
      caption: 'Active and draft categories together.',
    },
    {
      label: 'Payments',
      value: stats?.payments,
      Icon: BadgeIndianRupee,
      caption: 'Payment records created by Razorpay checkouts.',
    },
    {
      label: 'Coupons',
      value: stats?.coupons,
      Icon: Boxes,
      caption: 'Coupon codes stored in the catalog.',
    },
    {
      label: 'Reviews to moderate',
      value: stats?.pendingReviews,
      Icon: ShieldCheck,
      caption: 'Submitted reviews waiting for approve or reject.',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <StatCard {...card} loading={loading} />
          </li>
        ))}
      </ul>

      <StatCard
        label="Order value on this page"
        value={formatPrice(orderValue)}
        Icon={BadgeIndianRupee}
        loading={loading}
        caption={`Sum of the ${orders.length} most recent orders the API returned, excluding cancelled and refunded ones. The API has no revenue aggregate, so this is not a store-wide total.`}
      />
    </div>
  );
}
