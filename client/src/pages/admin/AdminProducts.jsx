import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AdminProductList from '../../components/admin/AdminProductList';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import ProductPagination from '../../components/product/ProductPagination';
import { ADMIN_PAGE_SIZE, clampPage } from '../../utils/pagination';
import { fetchCategories } from '../../slices/categorySlice';
import {
  editProductStatus,
  fetchProducts,
  removeProduct,
} from '../../slices/productSlice';
import { fetchVendors } from '../../slices/vendorSlice';

// Product management. An admin token on GET /products returns active and draft
// rows, so nothing has to be guessed from the storefront.
export default function AdminProducts() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories);
  const vendors = useSelector((state) => state.vendor);

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  // The catalog is the one admin list the API pages for itself (page/limit on
  // GET /products, totals in `products.pagination`), so the page owns the page
  // number and the other two lists are fetched once.
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: ADMIN_PAGE_SIZE, sort: 'newest' }));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchVendors());
  }, [dispatch]);

  const pages = products.pagination?.pages ?? 1;
  // The list can shrink under the pager (a delete on the last page), so the
  // rendered page is clamped to one that really has rows.
  const activePage = clampPage(page, pages);
  const total = products.pagination?.total ?? products.items.length;

  const categoryById = useMemo(
    () => new Map(categories.items.map((category) => [String(category._id), category])),
    [categories.items],
  );

  const vendorById = useMemo(
    () => new Map(vendors.items.map((vendor) => [String(vendor._id), vendor])),
    [vendors.items],
  );

  const handleToggleStatus = async (productId, status) => {
    setBusyId(productId);
    setNotice(null);

    try {
      await dispatch(editProductStatus({ productId, status })).unwrap();
      setNotice({ tone: 'success', text: `Product is now ${status}.` });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (productId) => {
    setBusyId(productId);
    setNotice(null);

    try {
      await dispatch(removeProduct(productId)).unwrap();
      setNotice({ tone: 'success', text: 'Product deleted.' });
      // Removing the only row of the last page would leave the pager on an
      // empty page, so step back one and let the effect refetch it.
      if (products.items.length <= 1 && page > 1) setPage(page - 1);
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog"
        title="Product management"
        description={`${total} products. Publishing needs an active category, and a product needs an approved vendor.`}
      >
        <Link
          to="/admin/products/new"
          className="inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          New product
        </Link>
      </DashboardPageHeader>

      {(notice || products.error) && (
        <p
          role={notice?.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            (notice?.tone === 'error' || products.error)
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice?.tone === 'error' ? notice.text : notice?.text ?? products.error}
        </p>
      )}

      <AdminProductList
        products={products.items}
        loading={products.loading && products.items.length === 0}
        error={products.items.length === 0 ? products.error : null}
        categoryById={categoryById}
        vendorById={vendorById}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        busyId={busyId}
      />

      <ProductPagination
        label="Product pages"
        page={activePage}
        pages={pages}
        total={total}
        limit={products.pagination?.limit ?? ADMIN_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
