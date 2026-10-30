import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import ProfileOrders from '../../components/profile/ProfileOrders';

// /account/orders — this customer's own orders from GET /orders.
export default function MyOrders() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="History"
        title="My orders"
        description="Only your own orders are returned by this endpoint. Cancellation is offered while the backend still allows it."
      />

      <ProfileOrders />
    </div>
  );
}
