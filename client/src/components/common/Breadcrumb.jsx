import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// The trail at the top-left of a page banner: Home › Shop › Product.
//
// `tone="dark"` is for banners that sit on a photo, where the trail has to read
// in white; the default is for a light background. The last item is the current
// page and is never a link.
export default function Breadcrumb({ items = [], tone = 'light', className = '' }) {
  if (items.length === 0) return null;

  const onPhoto = tone === 'dark';
  const linkTone = onPhoto
    ? 'text-white/75 hover:text-white'
    : 'text-muted hover:text-accent';
  const currentTone = onPhoto ? 'text-white' : 'text-primary';
  const separatorTone = onPhoto ? 'text-white/40' : 'text-muted/60';

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={crumb.href ?? crumb.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  size={12}
                  aria-hidden="true"
                  className={separatorTone}
                />
              )}

              {isLast || !crumb.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`font-medium ${currentTone}`}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.href} className={`transition-colors ${linkTone}`}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
