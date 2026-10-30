import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Store } from 'lucide-react';

import SideNav from '../dashboard/SideNav';
import { profileSections } from '../../data/dashboardNav';
import { selectVendorSystemEnabled } from '../../slices/siteSettingsSlice';

// Desktop sidebar for the customer profile area. The wishlist already has its
// own section in the list, so the footer only carries the vendor application,
// which lives outside the account area — and only while the vendor system is on.
export default function ProfileSidebar() {
  const vendorSystemEnabled = useSelector(selectVendorSystemEnabled);

  return (
    <SideNav
      label="My account"
      base="/account"
      sections={profileSections}
      footer={
        vendorSystemEnabled && (
          <Link
            to="/vendor/apply"
            className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-3 py-2.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Store size={14} strokeWidth={1.8} aria-hidden="true" />
            Become a vendor
          </Link>
        )
      }
    />
  );
}
