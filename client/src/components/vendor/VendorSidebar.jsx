import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

import SideNav from '../dashboard/SideNav';
import { vendorSections } from '../../data/dashboardNav';

// Desktop sidebar for the vendor area. AdminSidebar-style wrapper so the three
// areas share one rail implementation.
export default function VendorSidebar() {
  return (
    <SideNav
      label="Vendor"
      base="/vendor"
      sections={vendorSections}
      footer={
        <Link
          to="/vendor-preview"
          className="mt-2 flex items-center gap-2 rounded-2xl border border-dashed border-peach px-3 py-2.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
          Open UI preview
        </Link>
      }
    />
  );
}
