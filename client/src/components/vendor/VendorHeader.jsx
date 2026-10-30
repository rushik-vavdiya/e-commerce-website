import DashboardTopBar from '../dashboard/DashboardTopBar';
import { vendorSections } from '../../data/dashboardNav';

// Header for the vendor area, including the mobile copy of the sidebar links.
export default function VendorHeader() {
  return <DashboardTopBar areaLabel="VENDOR STUDIO" base="/vendor" sections={vendorSections} />;
}
