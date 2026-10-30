import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import {
  selectVendorSystemEnabled,
  setVendorSystemEnabled,
} from '../../slices/siteSettingsSlice';

// Admin store switches. The vendor system is the only one for now: turning it
// off removes every vendor surface from the storefront — store links, store
// results in search, store reviews on a product and the vendor application
// page. The value is stored in this browser (see siteSettingsSlice).
export default function AdminSettings() {
  const dispatch = useDispatch();
  const vendorSystemEnabled = useSelector(selectVendorSystemEnabled);

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Store settings"
        title="Vendor system"
        description="Choose whether the storefront shows vendor content at all. Changes apply to the storefront immediately."
      />

      <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
        <label
          htmlFor="enable-vendor-system"
          className="flex cursor-pointer items-start gap-4"
        >
          <input
            id="enable-vendor-system"
            name="enable-vendor-system"
            type="checkbox"
            checked={vendorSystemEnabled}
            onChange={(event) =>
              dispatch(setVendorSystemEnabled(event.target.checked))
            }
            className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
          />

          <span className="min-w-0">
            <span className="block text-sm font-medium text-primary">
              Enable Vendor System
            </span>

            <span className="mt-1 block text-xs leading-5 text-muted">
              On: stores appear in search, store links open a filtered collection,
              store reviews show on product pages and customers can apply to sell.
              Off: all of that is hidden and vendor pages are not available.
            </span>
          </span>
        </label>

        <p
          role="status"
          className="mt-5 rounded-2xl border border-dashed border-peach bg-peach/25 px-4 py-3 text-xs leading-5 text-muted"
        >
          Vendor system is{' '}
          <span className="font-semibold text-primary">
            {vendorSystemEnabled ? 'enabled' : 'disabled'}
          </span>
          . Vendor applications and stores are always available in the admin area,
          so they can be managed before the storefront shows them again.
        </p>
      </section>
    </div>
  );
}
