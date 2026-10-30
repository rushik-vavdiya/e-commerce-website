import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';

import { isActiveTopLevel } from '../../utils/navigation';

// The vertical filter rail on the collection page. Everything here is a real
// API filter: a category narrows GET /products by categoryId, availability maps
// to its `availability=available` option, size and colour arrive as comma lists
// (?sizes=XL,2XL & ?colors=Navy,Maroon) and the price pair as minPrice/maxPrice.
// The size and colour lists themselves come from GET /products/facets, so the
// rail only ever offers values the catalogue actually carries. Sort and the
// result count stay in the toolbar above the grid, since they change the order
// rather than the set.
//
// On phones the same body is folded into a <details>, so a long category list
// does not push the products below the fold.

const parentIdOf = (category) =>
  category?.parentCategoryId?._id ?? category?.parentCategoryId ?? null;

const hrefFor = ({ categorySlug, availability }) => {
  const params = new URLSearchParams();

  if (categorySlug) params.set('category', categorySlug);
  if (availability === 'available') params.set('availability', 'available');

  const query = params.toString();

  return query ? `/shop?${query}` : '/shop';
};

const LINK_BASE =
  'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
const LINK_IDLE = 'text-primary hover:bg-peach/30 hover:text-accent';
const LINK_ACTIVE = 'bg-primary font-medium text-white';

// One row shape for every option in the rail — radios and checkboxes alike —
// so the groups read as one list of choices.
const optionRow = (checked) =>
  `flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
    checked ? 'bg-peach/35 font-medium text-primary' : 'text-muted hover:bg-peach/20'
  }`;

const CLEAR_BUTTON =
  'text-xs font-medium text-accent transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded';

// Colour chips for the names the catalogue uses; any other name falls back to a
// soft neutral dot so every row keeps the same shape.
const SWATCHES = {
  black: '#1f2937',
  white: '#ffffff',
  ivory: '#f7f3e9',
  cream: '#f3ead7',
  beige: '#e5d9c3',
  navy: '#1f2f5e',
  'navy blue': '#1f2f5e',
  blue: '#2f6fd0',
  'teal blue': '#1f8a80',
  teal: '#1f8a80',
  red: '#d33a3a',
  crimson: '#c1121f',
  'crimson red': '#c1121f',
  maroon: '#7a2032',
  burgundy: '#6d1f2f',
  plum: '#6d2a52',
  pink: '#ec6ea8',
  'blush pink': '#f0b7c4',
  'dusty rose': '#d99a94',
  purple: '#7e4bd0',
  lavender: '#b9a3e7',
  green: '#2f8f57',
  'olive green': '#6f7a3a',
  mustard: '#d2a119',
  'mustard gold': '#d2a119',
  yellow: '#e8c33a',
  'turmeric yellow': '#e0a82a',
  orange: '#e07a2f',
  rust: '#b05a2a',
  brown: '#8a5a3b',
  'taupe brown': '#a89279',
  taupe: '#a89279',
  grey: '#a8a4a0',
  gray: '#a8a4a0',
  'charcoal grey': '#4b4a48',
  gold: '#cfa13c',
  'antique gold': '#c9a961',
  'golden': '#cfa13c',
  peach: '#f3b39a',
};

const swatchOf = (name) =>
  SWATCHES[String(name).trim().toLowerCase()] ?? '#d9d3ca';

// The price pair: two rupee fields that commit together, debounced, so typing
// digits does not fetch once per keystroke. The fields follow the URL (a Clear,
// the back button or a shared link all replace them) and a range whose floor
// sits above its ceiling is held back until it is fixed, because the API
// rejects min > max.
function PriceRangeInputs({ min, max, bounds, onChange }) {
  const [draft, setDraft] = useState({ min, max });
  const [last, setLast] = useState({ min, max });
  const timerRef = useRef(null);

  if (last.min !== min || last.max !== max) {
    // Follow the URL: a Clear, the back button or a shared link replaces both
    // fields at once, without an effect.
    setLast({ min, max });
    setDraft({ min, max });
  }

  // A URL change also drops any commit still in flight, so a timer scheduled
  // for the old value can never undo a Clear a moment later. The same cleanup
  // covers unmounting.
  useEffect(() => {
    clearTimeout(timerRef.current);
    return () => clearTimeout(timerRef.current);
  }, [min, max]);

  const update = (key, raw) => {
    const value = raw.replace(/\D/g, '').slice(0, 7);
    const next = { ...draft, [key]: value };
    setDraft(next);

    if (next.min && next.max && Number(next.min) > Number(next.max)) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), 450);
  };

  return (
    <>
      <div className="mt-3 flex items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-accent">
          <span className="text-xs text-muted" aria-hidden="true">
            ₹
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draft.min}
            onChange={(event) => update('min', event.target.value)}
            placeholder={bounds ? String(bounds.min) : 'Min'}
            aria-label="Minimum price"
            className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-primary outline-none placeholder:text-muted/70 focus:ring-0"
          />
        </label>

        <span className="text-sm text-muted" aria-hidden="true">
          –
        </span>

        <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-accent">
          <span className="text-xs text-muted" aria-hidden="true">
            ₹
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draft.max}
            onChange={(event) => update('max', event.target.value)}
            placeholder={bounds ? String(bounds.max) : 'Max'}
            aria-label="Maximum price"
            className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-primary outline-none placeholder:text-muted/70 focus:ring-0"
          />
        </label>
      </div>

      {bounds && (
        <p className="mt-2 px-1 text-xs text-muted">
          In the catalogue: ₹{bounds.min} – ₹{bounds.max}
        </p>
      )}
    </>
  );
}

function FilterBody({
  departments,
  childrenOf,
  activeCategoryId,
  availability,
  onSelectAvailability,
  sizes,
  colors,
  minPrice,
  maxPrice,
  filterOptions,
  onToggleSize,
  onToggleColor,
  onClearSizes,
  onClearColors,
  onPriceChange,
}) {
  const sizeOptions = filterOptions?.sizes ?? [];
  const colorOptions = filterOptions?.colors ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden="true" className="text-accent" />
          Categories
        </h2>

        <nav aria-label="Filter by category" className="mt-3 flex flex-col gap-1">
          <Link
            to={hrefFor({ availability })}
            aria-current={activeCategoryId ? undefined : 'page'}
            className={`${LINK_BASE} ${activeCategoryId ? LINK_IDLE : LINK_ACTIVE}`}
          >
            All products
          </Link>

          {departments.map((department) => {
            const children = childrenOf(department);
            const departmentActive = String(department._id) === String(activeCategoryId);

            return (
              <div key={department._id ?? department.slug} className="flex flex-col gap-1">
                <Link
                  to={hrefFor({ categorySlug: department.slug, availability })}
                  aria-current={departmentActive ? 'page' : undefined}
                  className={`${LINK_BASE} ${departmentActive ? LINK_ACTIVE : LINK_IDLE}`}
                >
                  {department.name}
                </Link>

                {children.length > 0 && (
                  <ul className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
                    {children.map((child) => {
                      const childActive = String(child._id) === String(activeCategoryId);

                      return (
                        <li key={child._id ?? child.slug}>
                          <Link
                            to={hrefFor({ categorySlug: child.slug, availability })}
                            aria-current={childActive ? 'page' : undefined}
                            className={`${LINK_BASE} text-[13px] ${
                              childActive
                                ? 'bg-peach/45 font-medium text-primary'
                                : 'text-muted hover:bg-peach/25 hover:text-accent'
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border pt-5">
        <h2 className="text-sm font-semibold text-primary">Availability</h2>

        <div className="mt-3 flex flex-col gap-1">
          {[
            { value: 'all', label: 'Everything' },
            { value: 'available', label: 'In stock only' },
          ].map((option) => {
            const checked = availability === option.value;

            return (
              <label key={option.value} className={optionRow(checked)}>
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={checked}
                  onChange={() => onSelectAvailability(option.value)}
                  className="size-3.5 cursor-pointer accent-[#C0563A]"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Sizes: every size any active product carries, straight from /facets. */}
      {sizeOptions.length > 0 && (
        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-primary">Size</h2>

            {sizes.length > 0 && (
              <button type="button" onClick={onClearSizes} className={CLEAR_BUTTON}>
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-1">
            {sizeOptions.map((value) => {
              const checked = sizes.includes(value);

              return (
                <label key={value} className={optionRow(checked)}>
                  <input
                    type="checkbox"
                    name="filter-size"
                    value={value}
                    checked={checked}
                    onChange={() => onToggleSize(value)}
                    className="size-3.5 cursor-pointer accent-[#C0563A]"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Colours: the same rows with a chip of the colour they name. */}
      {colorOptions.length > 0 && (
        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-primary">Colour</h2>

            {colors.length > 0 && (
              <button type="button" onClick={onClearColors} className={CLEAR_BUTTON}>
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-1">
            {colorOptions.map((value) => {
              const checked = colors.includes(value);

              return (
                <label key={value} className={optionRow(checked)}>
                  <input
                    type="checkbox"
                    name="filter-color"
                    value={value}
                    checked={checked}
                    onChange={() => onToggleColor(value)}
                    className="size-3.5 cursor-pointer accent-[#C0563A]"
                  />
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: swatchOf(value) }}
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price: shown even while the facet request is in flight, since the
          fields need no options list to be useful. */}
      <div className="border-t border-border pt-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-primary">Price range</h2>

          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => onPriceChange({ min: '', max: '' })}
              className={CLEAR_BUTTON}
            >
              Clear
            </button>
          )}
        </div>

        <PriceRangeInputs
          min={minPrice}
          max={maxPrice}
          bounds={filterOptions?.price ?? null}
          onChange={onPriceChange}
        />
      </div>
    </div>
  );
}

export default function ProductFilters({
  categories = [],
  activeCategoryId = null,
  availability = 'all',
  onSelectAvailability,
  sizes = [],
  colors = [],
  minPrice = '',
  maxPrice = '',
  filterOptions = null,
  onToggleSize,
  onToggleColor,
  onClearSizes,
  onClearColors,
  onPriceChange,
}) {
  const departments = categories.filter(isActiveTopLevel);

  const childrenOf = (department) =>
    categories.filter((category) => {
      const parentId = parentIdOf(category);
      return (
        Boolean(parentId) &&
        String(parentId) === String(department._id) &&
        category.status === 'active'
      );
    });

  const bodyProps = {
    departments,
    childrenOf,
    activeCategoryId,
    availability,
    onSelectAvailability,
    sizes,
    colors,
    minPrice,
    maxPrice,
    filterOptions,
    onToggleSize,
    onToggleColor,
    onClearSizes,
    onClearColors,
    onPriceChange,
  };

  const activeName =
    categories.find((category) => String(category._id) === String(activeCategoryId))?.name ?? '';

  return (
    <>
      {/* Phones and tablets: collapsed by default, so the grid stays near the top. */}
      <details className="group rounded-3xl border border-border bg-white p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden="true" className="text-accent" />
            Filters
            {activeName && (
              <span className="rounded-full bg-peach/50 px-2 py-0.5 text-[11px] font-medium text-primary">
                {activeName}
              </span>
            )}
          </span>

          <span className="text-xs font-normal text-muted group-open:hidden">Show</span>
          <span className="hidden text-xs font-normal text-muted group-open:inline">Hide</span>
        </summary>

        <div className="mt-5">
          <FilterBody {...bodyProps} />
        </div>
      </details>

      {/* Desktop: the rail sits beside the grid. Five groups make it taller
          than the screen, so it scrolls inside its own sticky column instead of
          pushing the lower groups out of reach. */}
      <aside
        aria-label="Product filters"
        className="hidden rounded-3xl border border-border bg-white p-5 lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto"
      >
        <FilterBody {...bodyProps} />
      </aside>
    </>
  );
}