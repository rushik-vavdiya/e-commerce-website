import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import VendorApplicationStatus from '../../components/vendor/VendorApplicationStatus';
import VendorProductList from '../../components/vendor/VendorProductList';
import VendorProfileCard from '../../components/vendor/VendorProfileCard';
import VendorStats from '../../components/vendor/VendorStats';
import { fetchCategories } from '../../slices/categorySlice';
import { fetchProducts } from '../../slices/productSlice';
import { fetchMyVendor } from '../../slices/vendorSlice';

// Vendor overview. Everything is the account's own data: the store record from
// GET /vendors/me and the products from GET /products with a vendor token.
export default function VendorOverview() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories);
  const vendor = useSelector((state) => state.vendor);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchMyVendor());
    dispatch(fetchProducts({ limit: 100, sort: 'newest' }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const categoryById = new Map(
    categories.items.map((category) => [String(category._id), category]),
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Your store"
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}`}
        description="A live view of your store record and the products you own."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/vendor/products/new"
            className="inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Add product
          </Link>

          <Link
            to="/vendor/profile"
            className="inline-flex min-h-10 items-center rounded-full border border-border bg-white px-5 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
          >
            Store profile
          </Link>
        </div>
      </DashboardPageHeader>

      <VendorStats
        products={products.items}
        loading={products.loading && products.items.length === 0}
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

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-primary">Your products</h2>
            <p className="mt-0.5 text-xs text-muted">
              {products.items.length} rows. Manage them on the products page.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="text-xs font-semibold text-accent transition-colors hover:text-primary"
          >
            Manage products
          </Link>
        </div>

        <VendorProductList
          products={products.items.slice(0, 4)}
          loading={products.loading && products.items.length === 0}
          error={products.items.length === 0 ? products.error : null}
          categoryById={categoryById}
          editable={false}
        />
      </section>
    </div>
  );
}
