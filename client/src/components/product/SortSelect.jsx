import { SlidersHorizontal } from 'lucide-react';

import { sortOptions } from '../../utils/catalog';

// Rounded select used by the listing pages. Native element on purpose, so it
// keeps the mobile picker.
export default function SortSelect({ value, onChange, id = 'sort-products' }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-white pl-3 pr-2">
      <SlidersHorizontal
        size={15}
        strokeWidth={1.7}
        aria-hidden="true"
        className="shrink-0 text-muted"
      />

      <label htmlFor={id} className="sr-only">
        Sort products
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 bg-transparent pr-1 text-xs font-medium text-primary outline-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
