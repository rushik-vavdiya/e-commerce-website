import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import VendorProductList from '../../components/vendor/VendorProductList';
import { fetchCategories } from '../../slices/categorySlice';
import { fetchProducts, removeProduct } from '../../slices/productSlice';
import { fetchMyVendor } from '../../slices/vendorSlice';

// Product listing and management for the signed-in vendor. GET /products scopes
// the result to this store, so no client-side vendor filtering is needed.
export default function VendorProducts() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories);
  const vendor = useSelector((state) => state.vendor);

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100, sort: 'newest' }));
    dispatch(fetchCategories());
    dispatch(fetchMyVendor());
  }, [dispatch]);

  const categoryById = new Map(
    categories.items.map((category) => [String(category._id), category]),
  );

  const handleDelete = async (productId) => {
    setBusyId(productId);
    setNotice(null);

    try {
      await dispatch(removeProduct(productId)).unwrap();
      setNotice({ tone: 'success', text: 'Product deleted.' });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Inventory"
        title="Product management"
        description={`${products.items.length} products in your store. Saved products stay drafts until an admin publishes them.`}
      >
        <Link
          to="/vendor/products/new"
          className="inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Add product
        </Link>
      </DashboardPageHeader>

      {notice && (
        <p
          role={notice.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      <VendorProductList
        products={products.items}
        loading={products.loading && products.items.length === 0}
        error={notice?.tone === 'error' ? null : products.error}
        categoryById={categoryById}
        onDelete={handleDelete}
        busyId={busyId}
      />

      {vendor.current && vendor.current.approvalStatus !== 'approved' && (
        <p className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-5 text-amber-800">
          Your application is <span className="font-semibold">{vendor.current.approvalStatus}</span>.
          Creating or editing products needs an approved, active store, so the
          backend will refuse these actions until an admin approves it.
        </p>
      )}
    </div>
  );
}
