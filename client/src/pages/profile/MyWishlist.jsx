import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import WishlistBoard from '../../components/wishlist/WishlistBoard';

// /account/wishlist — the same wishlist as /wishlist, shown inside the profile
// layout so the sidebar section does not send you out of the account area.
export default function MyWishlist() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Saved"
        title="My wishlist"
        description="Saved products with their live price and availability. Remove an item, or move it into your bag."
      />

      <WishlistBoard compact />
    </div>
  );
}
