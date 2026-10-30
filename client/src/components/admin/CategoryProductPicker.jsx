import { useMemo, useState } from 'react';
import { PackageSearch, Search, X } from 'lucide-react';

import Spinner from '../common/Spinner';
import { formatPrice } from '../../utils/format';

// The product picker inside the category form. It lists every product in the
// catalog with a checkbox, so products can be put in a category from the
// category side instead of editing each product. The parent form owns the
// selection; this component only filters the list and reports which rows the
// admin clicked.
export default function CategoryProductPicker({
  products = [],
  selectedIds,
  lockedIds,
  loading = false,
  error = null,
  disabled = false,
  onToggle,
  onSelectMany,
  onClearMany,
}) {
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.sku]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [products, search]);

  const visibleIds = visible.map((product) => String(product._id));
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  return (
    <section className="rounded-2xl border border-border bg-background/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-primary">
          <PackageSearch size={16} strokeWidth={1.8} aria-hidden="true" className="text-accent" />
          Products in this category
        </h3>

        <span className="text-xs text-muted">
          {selectedIds.size} of {products.length} selected
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-5 text-muted">
        Tick the products that should be listed in this category. A product whose
        main category is this one always stays selected.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-white pl-3 pr-2 focus-within:border-accent">
          <Search size={14} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-muted" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a product by name or SKU"
            aria-label="Find a product"
            disabled={disabled}
            className="min-h-9 w-full min-w-0 border-0 bg-transparent p-0 text-xs text-primary outline-none placeholder:text-muted"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear the product search"
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted hover:text-accent"
            >
              <X size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || visibleIds.length === 0 || allVisibleSelected}
          onClick={() => onSelectMany?.(visibleIds)}
          className="min-h-9 rounded-full border border-border bg-white px-3 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent disabled:opacity-45"
        >
          Select {search ? 'these' : 'all'}
        </button>

        <button
          type="button"
          disabled={disabled || selectedIds.size === 0}
          onClick={() => onClearMany?.(visibleIds)}
          className="min-h-9 rounded-full border border-border bg-white px-3 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-45"
        >
          {search ? 'Clear these' : 'Clear all'}
        </button>
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-border bg-white">
        {loading && products.length === 0 && (
          <p className="flex items-center gap-2 px-4 py-6 text-xs text-muted">
            <Spinner size={14} label="Loading products…" />
          </p>
        )}

        {!loading && error && (
          <p role="alert" className="px-4 py-4 text-xs text-red-600">
            Products could not be loaded: {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="px-4 py-6 text-xs text-muted">
            No products yet. Create a product first, then it appears here.
          </p>
        )}

        {!loading && !error && products.length > 0 && visible.length === 0 && (
          <p className="px-4 py-6 text-xs text-muted">
            No product matches “{search}”.
          </p>
        )}

        <ul className="divide-y divide-border">
          {visible.map((product) => {
            const id = String(product._id);
            const checked = selectedIds.has(id);
            const locked = Boolean(lockedIds?.has(id));

            return (
              <li key={id}>
                <label
                  className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                    locked
                      ? 'cursor-default bg-peach/15'
                      : 'cursor-pointer hover:bg-peach/20'
                  } ${disabled ? 'opacity-60' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || locked}
                    onChange={() => onToggle?.(id)}
                    className="size-4 shrink-0 cursor-pointer rounded border-border accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default"
                  />

                  <span className="size-9 shrink-0 overflow-hidden rounded-lg border border-border bg-peach/25">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-muted">
                        <PackageSearch size={13} strokeWidth={1.6} aria-hidden="true" />
                      </span>
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-primary">
                      {product.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {formatPrice(product.price)}
                      {product.sku ? ` · ${product.sku}` : ''}
                    </span>
                  </span>

                  {locked && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                      Main
                    </span>
                  )}

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                      product.status === 'active'
                        ? 'bg-peach/60 text-primary'
                        : 'bg-background text-muted'
                    }`}
                  >
                    {product.status}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
