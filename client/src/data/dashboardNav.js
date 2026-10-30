// Navigation for the three signed-in areas. The sidebars and the mobile menus
// in the headers both read from here, so a section is added in one place.
import {
  Boxes,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  PenLine,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingBag,
  Star,
  Store,
  Tags,
  Users,
} from 'lucide-react';

// Paths are relative to the area root (/admin, /vendor, /account).
export const adminSections = [
  { label: 'Overview', to: '.', end: true, Icon: LayoutDashboard },
  { label: 'Orders', to: 'orders', Icon: ClipboardList },
  { label: 'Products', to: 'products', Icon: Package },
  { label: 'Add product', to: 'products/new', Icon: Boxes },
  { label: 'Categories', to: 'categories', Icon: Tags },
  { label: 'Vendors', to: 'vendors', Icon: Store },
  { label: 'Customers', to: 'customers', Icon: Users },
  { label: 'Newsletter', to: 'newsletter', Icon: Mail },
  { label: 'Review moderation', to: 'reviews', Icon: ShieldCheck },
  { label: 'Settings', to: 'settings', Icon: Settings },
];

export const vendorSections = [
  { label: 'Overview', to: '.', end: true, Icon: LayoutDashboard },
  { label: 'Products', to: 'products', Icon: Package },
  { label: 'Add product', to: 'products/new', Icon: Boxes },
  { label: 'Reviews', to: 'reviews', Icon: Star },
  { label: 'Store profile', to: 'profile', Icon: Store },
  { label: 'Account settings', to: 'settings', Icon: Settings },
];

export const profileSections = [
  { label: 'Overview', to: '.', end: true, Icon: LayoutDashboard },
  { label: 'Personal information', to: 'profile', Icon: Users },
  { label: 'Addresses', to: 'addresses', Icon: MapPin },
  { label: 'Change password', to: 'password', Icon: LockKeyhole },
  { label: 'My orders', to: 'orders', Icon: ShoppingBag },
  { label: 'My wishlist', to: 'wishlist', Icon: Heart },
  { label: 'Write a review', to: 'review', Icon: PenLine },
  { label: 'Preferences', to: 'preferences', Icon: SlidersHorizontal },
  { label: 'Account settings', to: 'settings', Icon: Settings },
];
