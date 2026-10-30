import { X } from 'lucide-react';

import Spinner from '../common/Spinner';
import SortSelect from './SortSelect';

// Result count plus the search and sort controls used above every product grid.
export default function ProductToolbar({
  count = 0,
  loading = false,
  search = '',
  onClearSearch,
  sort,
  onSortChange,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="flex items-center gap-2 text-xs text-muted sm:text-sm" aria-live="polite">
        {loading ? (
          <Spinner size={13} label="Loading products…" />
        ) : (
          `${count} ${count === 1 ? 'product' : 'products'}`
        )}
      </p>

      <div className="flex items-center gap-3">
        {search && (
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
          >
            <X size={14} strokeWidth={1.8} aria-hidden="true" />
            Clear search
          </button>
        )}

        <SortSelect value={sort} onChange={onSortChange} />
      </div>
    </div>
  );
}
