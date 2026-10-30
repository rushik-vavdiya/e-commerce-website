import DashboardTopBar from '../dashboard/DashboardTopBar';
import { adminSections } from '../../data/dashboardNav';

// Header for the admin area, including the mobile copy of the sidebar links.
export default function AdminHeader() {
  return <DashboardTopBar areaLabel="ADMIN AREA" base="/admin" sections={adminSections} />;
}
