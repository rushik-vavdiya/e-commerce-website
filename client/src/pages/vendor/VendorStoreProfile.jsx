import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import VendorApplicationStatus from '../../components/vendor/VendorApplicationStatus';
import VendorProfileCard from '../../components/vendor/VendorProfileCard';
import VendorStoreForm from '../../components/vendor/VendorStoreForm';
import { editMyVendor, fetchMyVendor } from '../../slices/vendorSlice';

// Store profile: the record from GET /vendors/me plus the editable form that
// PATCHes the same endpoint (approved vendors only, enforced by the backend).
export default function VendorStoreProfile() {
  const dispatch = useDispatch();

  const vendor = useSelector((state) => state.vendor);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchMyVendor());
  }, [dispatch]);

  const handleSubmit = async (values) => {
    await dispatch(editMyVendor(values)).unwrap();
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Your store"
        title="Store profile"
        description="Store details come from GET /vendors/me. Saving updates them through PATCH /vendors/me."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <VendorProfileCard
          vendor={vendor.current}
          user={user}
          loading={vendor.loading && !vendor.current}
          error={vendor.current ? null : vendor.error}
        />

        <VendorApplicationStatus
          vendor={vendor.current}
          loading={vendor.loading && !vendor.current}
        />
      </div>

      {vendor.current ? (
        <VendorStoreForm
          initial={vendor.current}
          onSubmit={handleSubmit}
          busy={vendor.loading}
          error={vendor.error}
        />
      ) : (
        !vendor.loading && (
          <p className="rounded-3xl border border-dashed border-border bg-white px-5 py-6 text-sm text-muted">
            {vendor.error ||
              'No store record was returned for this account, so there is nothing to edit yet.'}
          </p>
        )
      )}
    </div>
  );
}
