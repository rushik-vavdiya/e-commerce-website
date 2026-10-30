import { AlertTriangle, PackageSearch } from 'lucide-react';

import Button from './Button';

const stateStyles = {
  error: {
    Icon: AlertTriangle,
    iconClass: 'bg-red-100 text-red-700',
  },
  empty: {
    Icon: PackageSearch,
    iconClass: 'bg-peach/50 text-accent',
  },
};

// Shared panel for the empty and error states of a page section.
export default function PageState({
  variant = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  const { Icon, iconClass } = stateStyles[variant] ?? stateStyles.empty;

  return (
    <div
      className={[
        'flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-background px-6 py-14 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className={`flex size-14 items-center justify-center rounded-full ${iconClass}`}
      >
        <Icon size={26} strokeWidth={1.6} />
      </span>

      <div>
        <h2 className="font-serif text-xl font-medium text-primary">{title}</h2>

        {description && (
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
