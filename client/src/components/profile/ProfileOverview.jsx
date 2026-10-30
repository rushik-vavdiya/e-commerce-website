import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ImageOff, ShoppingBag } from 'lucide-react';

import StatusPill from '../dashboard/StatusPill';
import { fetchMe } from '../../slices/userSlice';
import { fetchOrders } from '../../slices/orderSlice';
import { fetchWishlist } from '../../slices/wishlistSlice';
import { roleLabel } from '../../utils/authHelpers';
import { formatDate } from '../../utils/format';

const Row = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <span className="text-xs text-muted">{label}</span>
    <span className="text-sm font-medium text-primary">{value || '—'}</span>
  </div>
);

// Read-only account summary. Everything comes from the auth slice (login
// response) and the user slice (GET /users/me), plus the real order and wishlist
// counts loaded from their own endpoints.
export default function ProfileOverview() {
  const dispatch = useDispatch();

  const sessionUser = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.user.profile);
  const orders = useSelector((state) => state.orders);
  const wishlist = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchOrders());
    dispatch(fetchWishlist());
  }, [dispatch]);

  const user = profile ?? sessionUser;
  const picture = user?.profilePicture ?? null;
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Customer';

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <section className="flex w-full flex-col gap-5 rounded-3xl border border-border bg-white p-5 sm:p-6 xl:max-w-sm">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-peach/30">
            {picture ? (
              <img src={picture} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff size={20} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
            )}
          </span>

          <div className="min-w-0">
            <p className="truncate text-base font-medium text-primary">{fullName}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusPill value={user?.role} label={roleLabel(user?.role)} tone="accent" />
              <StatusPill value={user?.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/account/orders"
            className="rounded-2xl border border-border bg-background p-4 transition-colors hover:border-accent"
          >
            <ShoppingBag size={18} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
            <p className="mt-2 font-serif text-2xl font-medium text-primary">
              {orders.items.length}
            </p>
            <p className="text-xs text-muted">Orders</p>
          </Link>

          <Link
            to="/account/wishlist"
            className="rounded-2xl border border-border bg-background p-4 transition-colors hover:border-accent"
          >
            <Heart size={18} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
            <p className="mt-2 font-serif text-2xl font-medium text-primary">
              {wishlist.wishlist?.products?.length ?? 0}
            </p>
            <p className="text-xs text-muted">Saved items</p>
          </Link>
        </div>

        <Link
          to="/account/profile"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Edit personal information
        </Link>
      </section>

      <section className="min-w-0 flex-1 rounded-3xl border border-border bg-white p-5 sm:p-6">
        <h2 className="text-base font-medium text-primary">Account details</h2>
        <p className="mt-0.5 text-xs text-muted">
          Read from GET /users/me. Update the editable values on the personal
          information page.
        </p>

        <div className="mt-4">
          <Row label="Full name" value={fullName} />
          <Row label="Email" value={user?.email} />
          <Row label="Phone" value={user?.phone} />
          <Row label="Gender" value={user?.gender} />
          <Row
            label="Birth date"
            value={
              formatDate(user?.birthDate)
            }
          />
          <Row label="Role" value={roleLabel(user?.role)} />
          <Row label="Account status" value={user?.status} />
          <Row label="Email verified" value={user?.emailVerified ? 'Yes' : 'No'} />
          <Row
            label="Member since"
            value={
              formatDate(user?.createdAt)
            }
          />
        </div>

        {orders.error && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            Orders could not be loaded: {orders.error}
          </p>
        )}

        {wishlist.error && (
          <p className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            Wishlist could not be loaded: {wishlist.error}
          </p>
        )}
      </section>
    </div>
  );
}
