import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ImageOff, Pencil } from 'lucide-react';

import StatusPill from '../dashboard/StatusPill';
import { formatPrice } from '../../utils/format';

// Product management. GET /products with an admin token returns every product,
// drafts included, which is what this table shows.
export default function AdminProductList({
  products = [],
  loading = false,
  error = null,
  categoryById = null,
  vendorById = null,
  onToggleStatus,
  onDelete,
  busyId = null,
}) {
  const [confirmingId, setConfirmingId] = useState(null);

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-3xl border border-border bg-white/60" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
        No products yet. Vendors create drafts and an admin publishes them.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {products.map((product) => {
        const busy = busyId === product._id;
        const category = categoryById?.get?.(String(product.categoryId));
        const vendor = vendorById?.get?.(String(product.vendorId));

        return (
          <li
            key={product._id}
            className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:gap-5"
          >
            <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-peach/25">
              {product.mainImage ? (
                <img
                  src={product.mainImage}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageOff size={20} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-medium text-primary">
                  {product.name}
                </h3>
                <StatusPill value={product.status} />
              </div>

              <p className="mt-1 text-xs text-muted">
                {category?.name ?? 'Category removed'}
                {product.sku ? ` · SKU ${product.sku}` : ''}
                {` · ${formatPrice(product.price)} · stock ${product.stock ?? 0}`}
              </p>

              <p className="mt-1 text-[11px] text-muted">
                {Number(product.ratingAverage) > 0
                  ? `${Number(product.ratingAverage).toFixed(1)} ★ from ${product.reviewCount ?? 0} reviews`
                  : 'No approved reviews yet'}
                {` · ${
                  product.vendorId ? vendor?.storeName ?? 'Vendor store not loaded' : 'No store (marketplace)'
                }`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/admin/products/${product._id}/edit`}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              >
                <Pencil size={14} strokeWidth={1.8} aria-hidden="true" />
                Edit
              </Link>

              <Link
                to={`/products/${product._id}`}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              >
                <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
                View
              </Link>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  onToggleStatus?.(product._id, product.status === 'active' ? 'draft' : 'active')
                }
                className="inline-flex min-h-9 items-center rounded-full border border-border px-4 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
              >
                {product.status === 'active' ? 'Move to draft' : 'Publish'}
              </button>

              {confirmingId === product._id ? (
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      onDelete?.(product._id);
                      setConfirmingId(null);
                    }}
                    className="inline-flex min-h-9 items-center rounded-full bg-red-700 px-4 text-xs font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-45"
                  >
                    Delete for good
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="text-xs font-medium text-muted transition-colors hover:text-primary"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirmingId(product._id)}
                  className="inline-flex min-h-9 items-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
