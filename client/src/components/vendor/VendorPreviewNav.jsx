import { vendorSections } from '../../data/dashboardNav';

// Section switcher for /vendor-preview. It deliberately uses buttons and local
// state instead of links: the real /vendor/* routes are role protected, and this
// preview must not impersonate a vendor session or trip the auth guard.
export default function VendorPreviewNav({ active, onChange }) {
  return (
    <nav
      aria-label="Vendor preview sections"
      className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch lg:gap-1 lg:rounded-3xl lg:border lg:border-border lg:bg-white lg:p-3"
    >
      <p className="hidden px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted lg:block">
        Vendor (preview)
      </p>

      {vendorSections.map(({ label, to, Icon }) => {
        const isActive = active === to;

        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(to)}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors lg:gap-3 lg:rounded-2xl lg:px-3 lg:py-2.5 lg:text-sm',
              isActive
                ? 'bg-primary text-white'
                : 'border border-border bg-white text-primary hover:border-accent hover:text-accent lg:border-0 lg:bg-transparent lg:hover:bg-peach/40',
            ].join(' ')}
          >
            {Icon && <Icon size={16} strokeWidth={1.8} aria-hidden="true" />}
            <span className="min-w-0 truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
