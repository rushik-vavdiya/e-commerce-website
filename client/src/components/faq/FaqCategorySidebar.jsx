// Vertical category picker for the FAQ page. Selecting a topic swaps the
// questions on the right, so only one group is ever shown. On phones the list
// scrolls horizontally as chips; on desktop it is a sticky column.
export default function FaqCategorySidebar({
  groups = [],
  activeId,
  onSelect,
  label = 'Browse by topic',
}) {
  if (groups.length === 0) return null;

  return (
    <nav
      aria-label="FAQ categories"
      className="w-full lg:sticky lg:top-28 lg:w-[280px] lg:shrink-0"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
        {label}
      </p>

      <ul className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
        {groups.map((group) => {
          const isActive = group.id === activeId;

          return (
            <li key={group.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(group.id)}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                  isActive
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-white text-primary hover:border-accent hover:text-accent',
                ].join(' ')}
              >
                <span className="whitespace-nowrap lg:whitespace-normal">
                  {group.title}
                </span>

                <span
                  className={[
                    'hidden size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold sm:flex',
                    isActive ? 'bg-white/20 text-white' : 'bg-background text-muted',
                  ].join(' ')}
                >
                  {group.items.length}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
