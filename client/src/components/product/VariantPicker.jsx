import { useState } from 'react';
import { Check, Ruler } from 'lucide-react';

import { productColours, productSizes } from '../../utils/variants';
import { colourSwatch } from '../../utils/colourSwatches';

// How many size chips are on screen before the rest are folded away. The kurti
// catalogue is sold in XL, 2XL and 3XL, so nothing folds in practice, but a
// product with a long size run still keeps its add-to-bag button on the first
// screen.
const SIZE_CHIPS = 12;

// The little round swatch that shows a colour. A colour with no known shade gets
// a neutral chip rather than a made-up one.
const SWATCH_FALLBACK = '#D9CEC4';

// Colour and size selection for the product detail page. It is controlled: the
// page owns `colour` and `size`, so it can point the gallery at the colour that
// is chosen and add the matching combination to the cart.
//
// Only the options that are on the product record are drawn. A size that has no
// stock is shown struck through and cannot be chosen, rather than being hidden or
// pretending to be available.
export default function VariantPicker({
  product,
  colour = null,
  size = null,
  onColourChange,
  onSizeChange,
}) {
  const [showAllSizes, setShowAllSizes] = useState(false);

  const colours = productColours(product);
  const sizes = productSizes(product, colour);

  if (colours.length === 0 && sizes.length === 0) return null;

  const chosenSize = sizes.find((entry) => entry.label === size) ?? null;
  const inStock = sizes.filter((entry) => entry.stock > 0);
  const shownSizes = showAllSizes ? sizes : sizes.slice(0, SIZE_CHIPS);
  const hiddenCount = sizes.length - shownSizes.length;

  return (
    <div className="mt-7 flex flex-col gap-6">
      {colours.length > 0 && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Colour
            </h2>
            <span className="text-xs text-muted">
              {colours.length > 1
                ? `${colours.length} colours`
                : 'The only colour this design is made in'}
            </span>
          </div>

          {colours.length > 1 ? (
            <ul className="mt-3 flex flex-wrap items-center gap-3">
              {colours.map((entry) => {
                const isSelected = entry.name === colour;

                return (
                  <li key={entry.name}>
                    <button
                      type="button"
                      onClick={() => onColourChange?.(entry.name)}
                      aria-pressed={isSelected}
                      title={
                        entry.stock > 0
                          ? `Show ${entry.name}`
                          : `${entry.name} is out of stock`
                      }
                      className={[
                        'relative flex size-12 items-center justify-center overflow-hidden rounded-full border-2 transition-colors',
                        isSelected ? 'border-accent' : 'border-border hover:border-accent/60',
                      ].join(' ')}
                    >
                      {entry.image ? (
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="h-full w-full rounded-full"
                          style={{ backgroundColor: colourSwatch(entry.name) ?? SWATCH_FALLBACK }}
                        />
                      )}

                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center bg-primary/35 text-white">
                          <Check size={16} strokeWidth={2.4} aria-hidden="true" />
                        </span>
                      )}
                    </button>

                    <span className="mt-1.5 block max-w-16 text-center text-[11px] leading-4 text-muted">
                      {entry.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="mt-3 flex flex-wrap items-center gap-3">
              {colours.map((entry) => (
                <li key={entry.name}>
                  <span
                    className={[
                      'inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5',
                      entry.name === colour
                        ? 'border-accent bg-white'
                        : 'border-border bg-white',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className="size-4 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: colourSwatch(entry.name) ?? SWATCH_FALLBACK }}
                    />
                    <span className="text-xs font-medium text-primary">{entry.name}</span>
                    {entry.name === colour && (
                      <Check size={13} strokeWidth={2.4} aria-hidden="true" className="text-accent" />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Ruler size={14} strokeWidth={1.8} aria-hidden="true" className="text-accent" />
              Size
            </h2>

            {chosenSize && (
              <span className="text-xs text-muted">
                {chosenSize.stock > 0
                  ? `${chosenSize.stock} in stock`
                  : 'Out of stock — choose another size'}
              </span>
            )}
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {shownSizes.map((entry) => {
              const isSelected = entry.label === size;
              const available = entry.stock > 0;

              return (
                <li key={entry.label}>
                  <button
                    type="button"
                    onClick={() => onSizeChange?.(entry.label)}
                    disabled={!available}
                    aria-pressed={isSelected}
                    title={
                      available
                        ? `${entry.label} — ${entry.stock} in stock`
                        : `${entry.label} is out of stock`
                    }
                    className={[
                      'inline-flex min-h-10 min-w-12 items-center justify-center rounded-xl border px-3 text-xs font-medium transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-white text-primary',
                      available ? '' : 'text-muted line-through opacity-60',
                      available && !isSelected
                        ? 'hover:border-accent hover:text-accent'
                        : '',
                      'disabled:cursor-not-allowed',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {entry.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>
              Sizes {sizes[0].label}–{sizes[sizes.length - 1].label} on record ·{' '}
              {inStock.length} available
            </span>

            {(hiddenCount > 0 || showAllSizes) && (
              <button
                type="button"
                onClick={() => setShowAllSizes((value) => !value)}
                className="font-semibold text-accent underline decoration-border underline-offset-4"
              >
                {showAllSizes ? 'Show fewer sizes' : `Show all ${sizes.length} sizes`}
              </button>
            )}
          </div>

          {inStock.length === 0 && (
            <p className="mt-3 text-xs font-medium text-accent">
              Every size is currently out of stock for this colour.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
