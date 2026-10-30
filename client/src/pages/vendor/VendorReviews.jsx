import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import VendorReviewList from '../../components/vendor/VendorReviewList';
import { fetchProducts } from '../../slices/productSlice';
import { fetchProductReviews } from '../../slices/reviewSlice';

// Reviews on this vendor's products. The review slice holds one product's reviews
// at a time, so the page picks a product and loads its approved reviews.
export default function VendorReviews() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products);
  const reviews = useSelector((state) => state.reviews);

  const [chosenId, setChosenId] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100, sort: 'newest' }));
  }, [dispatch]);

  // Until the vendor picks a product, default to the one with the most approved
  // reviews (derived, so no state has to be written from an effect).
  const defaultProduct = useMemo(
    () =>
      [...products.items].sort(
        (a, b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0),
      )[0] ?? null,
    [products.items],
  );

  const selectedId = chosenId || defaultProduct?._id || '';

  const selectedProduct =
    products.items.find((item) => String(item._id) === String(selectedId)) ?? null;

  useEffect(() => {
    if (selectedId) dispatch(fetchProductReviews(selectedId));
  }, [dispatch, selectedId]);

  // The slice clears its rows when a new request starts and records which product
  // they belong to, so a slow request can never show another product's reviews.
  const rowsForSelected = reviews.itemsProductId === selectedId;

  const groups =
    selectedProduct && rowsForSelected && !reviews.loading
      ? [
          {
            productId: selectedProduct._id,
            productName: selectedProduct.name,
            status: selectedProduct.status,
            ratingAverage: selectedProduct.ratingAverage,
            reviews: reviews.items,
          },
        ]
      : [];

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Feedback"
        title="Product reviews"
        description="Approved reviews for your products. They come from the public product review endpoint, so pending reviews stay hidden until an admin approves them."
      />

      {products.error && (
        <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {products.error}
        </p>
      )}

      {products.items.length > 0 && (
        <div className="flex w-full max-w-xl flex-col gap-1.5">
          <label htmlFor="vendor-review-product" className="text-sm font-medium text-primary">
            Choose a product
          </label>

          <select
            id="vendor-review-product"
            value={selectedId}
            onChange={(event) => setChosenId(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          >
            {products.items.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} ({product.reviewCount ?? 0} approved)
              </option>
            ))}
          </select>
        </div>
      )}

      <VendorReviewList
        groups={groups}
        loading={reviews.loading || (Boolean(selectedId) && !rowsForSelected)}
        error={groups.length === 0 ? reviews.error : null}
        emptyMessage={
          products.items.length === 0
            ? 'You have no products yet, so there is nothing to review.'
            : 'No approved reviews on this product yet.'
        }
      />
    </div>
  );
}
