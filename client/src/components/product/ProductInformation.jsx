import { Link } from 'react-router-dom';
import { Box, RotateCcw, Ruler, ShieldCheck, Truck } from 'lucide-react';

import { productColours, productSizes } from '../../utils/variants';
import { colourSwatch } from '../../utils/colourSwatches';

// Product information panel for the product detail page. It only ever shows
// fields that exist on the product document (productSpecifications, sku,
// dimensions, weight, stock); anything missing is described as not recorded
// instead of being invented.
const hasDimensions = (dimensions) =>
  dimensions &&
  ['length', 'width', 'height'].some((side) => Number(dimensions[side]) > 0);

export default function ProductInformation({ product }) {
  if (!product) return null;

  const specifications = product.productSpecifications ?? [];
  const colours = productColours(product);
  const sizes = productSizes(product);
  const inStockSizes = sizes.filter((size) => size.stock > 0);

  const details = [
    ...specifications.map((item) => ({ label: item.key, value: item.value })),
    product.sku ? { label: 'SKU', value: product.sku } : null,
    product.weight ? { label: 'Weight', value: `${product.weight} g` } : null,
    hasDimensions(product.dimensions)
      ? {
          label: 'Dimensions',
          value: ['length', 'width', 'height']
            .filter((side) => Number(product.dimensions[side]) > 0)
            .map((side) => `${side[0].toUpperCase()} ${product.dimensions[side]}`)
            .join(' × '),
        }
      : null,
  ].filter(Boolean);

  return (
    <section id="product-information" className="mt-16 border-t border-border pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            The details
          </p>

          <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
            Product information
          </h2>
        </div>

        <p className="max-w-sm text-xs text-muted">
          Everything below is read from this product record — nothing is filled in
          on your behalf.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Specifications */}
        <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Specifications
          </h3>

          {details.length > 0 ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,160px)_minmax(0,1fr)]">
              {details.map((detail, index) => (
                <div key={`${detail.label}-${index}`} className="contents">
                  <dt className="text-xs font-medium text-muted">{detail.label}</dt>
                  <dd className="text-xs text-primary sm:border-b sm:border-border sm:pb-3">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-xs leading-5 text-muted">
              No specifications are recorded for this product yet. A vendor or an
              admin can add them on the product form (one “Label: value” per line),
              and they appear here straight away.
            </p>
          )}

          {product.description && (
            <div className="mt-6 border-t border-border pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Description
              </h4>
              <p className="mt-2 text-sm leading-7 text-muted">{product.description}</p>
            </div>
          )}
        </div>

        {/* Fit, sizes and delivery promises */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Ruler size={15} strokeWidth={1.8} aria-hidden="true" className="text-accent" />
              Size and fit
            </h3>

            {sizes.length > 0 ? (
              <>
                <p className="mt-3 text-xs text-muted">
                  Sizes {sizes[0].label}–{sizes[sizes.length - 1].label} are on the
                  record. {inStockSizes.length} of {sizes.length} can be ordered
                  today.
                </p>

                <ul className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((entry) => (
                    <li
                      key={entry.label}
                      className={[
                        'inline-flex min-h-8 items-center rounded-full border px-3 text-xs',
                        entry.stock > 0
                          ? 'border-border bg-background text-primary'
                          : 'border-dashed border-border bg-white text-muted line-through',
                      ].join(' ')}
                      title={
                        entry.stock > 0
                          ? `${entry.label} — ${entry.stock} in stock`
                          : `${entry.label} — out of stock`
                      }
                    >
                      {entry.label}
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-[11px] leading-5 text-muted">
                  A struck-through size has no stock and cannot be added to the bag.
                </p>
              </>
            ) : (
              <p className="mt-3 text-xs leading-5 text-muted">
                This product has no size options on its record — it is sold as a
                single item.
              </p>
            )}

            {colours.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs text-muted">
                  Colour{colours.length > 1 ? 's' : ''} on record
                </p>

                <ul className="mt-2 flex flex-wrap items-center gap-2">
                  {colours.map((entry) => (
                    <li
                      key={entry.name}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1"
                    >
                      <span
                        aria-hidden="true"
                        className="size-3.5 rounded-full ring-1 ring-inset ring-black/10"
                        style={{ backgroundColor: colourSwatch(entry.name) ?? '#D9CEC4' }}
                      />
                      <span className="text-xs font-medium text-primary">{entry.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted">
              <Box size={14} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0" />
              Fit notes come from the specifications above. If a product lists no fit
              note, ask us before ordering — we will not guess a size for you.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Truck size={15} strokeWidth={1.8} aria-hidden="true" className="text-accent" />
              Shipping and returns
            </h3>

            <ul className="mt-4 flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Truck size={17} strokeWidth={1.7} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                <span className="text-xs leading-5 text-muted">
                  Free shipping over ₹999. Orders are dispatched within one working
                  day and tracked from our door to yours.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <RotateCcw size={17} strokeWidth={1.7} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                <span className="text-xs leading-5 text-muted">
                  Seven days to start a return on unworn items with their tags
                  attached. Start it from My orders in your account.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <ShieldCheck size={17} strokeWidth={1.7} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                <span className="text-xs leading-5 text-muted">
                  Payments are handled by Razorpay over an encrypted connection; card
                  details never reach this server.
                </span>
              </li>
            </ul>

            <p className="mt-4 text-[11px] leading-5 text-muted">
              Store policy text (not product data). The full policy lives in the{' '}
              <Link to="/faq" className="font-medium text-accent hover:underline">
                FAQ
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
