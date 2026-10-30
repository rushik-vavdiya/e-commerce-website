import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AdminStats from '../../components/admin/AdminStats';
import OrderChart from '../../components/admin/OrderChart';
import RecentOrders from '../../components/admin/RecentOrders';
import VendorApprovalList from '../../components/admin/VendorApprovalList';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import { fetchAdminDashboard } from '../../slices/adminSlice';
import { changeOrderStatus, fetchOrders } from '../../slices/orderSlice';
import { fetchVendors, reviewVendorApplication } from '../../slices/vendorSlice';

// Overview: storefront counts, the newest orders and the vendor applications that
// still need a decision. Every number comes from GET /admin/dashboard, GET
// /orders and GET /vendors.
export default function AdminOverview() {
  const dispatch = useDispatch();

  const admin = useSelector((state) => state.admin);
  const orders = useSelector((state) => state.orders);
  const vendor = useSelector((state) => state.vendor);

  const [busyOrderId, setBusyOrderId] = useState(null);
  const [busyVendorId, setBusyVendorId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchOrders());
    dispatch(fetchVendors());
  }, [dispatch]);

  const pendingVendors = vendor.items.filter((item) =>
    ['pending', 'under_review'].includes(item.approvalStatus),
  );

  const handleOrderStatus = async (orderId, orderStatus) => {
    setBusyOrderId(orderId);
    setNotice(null);

    try {
      await dispatch(changeOrderStatus({ orderId, orderStatus })).unwrap();
      await dispatch(fetchOrders()).unwrap();
      setNotice({ tone: 'success', text: `Order moved to ${orderStatus}.` });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleVendorReview = async (vendorId, approvalStatus, rejectionReason) => {
    setBusyVendorId(vendorId);
    setNotice(null);

    try {
      await dispatch(
        reviewVendorApplication({ vendorId, approvalStatus, rejectionReason }),
      ).unwrap();
      setNotice({
        tone: 'success',
        text:
          approvalStatus === 'approved'
            ? 'Vendor approved. That account now has the vendor role.'
            : `Application marked ${approvalStatus}.`,
      });
      await dispatch(fetchVendors());
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyVendorId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Storefront health"
        title="Admin overview"
        description="Live counts and the newest activity from the existing admin API. Figures are read from the database, not estimated."
      />

      {(admin.error || orders.error) && (
        <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {admin.error || orders.error}
        </p>
      )}

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

      <AdminStats
        stats={admin.dashboard}
        orders={orders.items}
        loading={admin.loading && !admin.dashboard}
      />

      {/* The chart needs the raw order list, not the sliced table rows. */}
      <OrderChart
        orders={orders.items}
        loading={orders.loading && orders.items.length === 0}
      />

      <RecentOrders
        orders={orders.items}
        loading={orders.loading && orders.items.length === 0}
        error={orders.error}
        onStatusChange={handleOrderStatus}
        busyOrderId={busyOrderId}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-primary">
              Vendor applications waiting
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {pendingVendors.length} of {vendor.items.length} applications need a
              decision.
            </p>
          </div>
        </div>

        {vendor.error && (
          <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {vendor.error}
          </p>
        )}

        <VendorApprovalList
          vendors={pendingVendors}
          loading={vendor.loading && vendor.items.length === 0}
          onReview={handleVendorReview}
          busyId={busyVendorId}
        />
      </section>
    </div>
  );
}
