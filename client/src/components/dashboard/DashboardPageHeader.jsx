// Heading used at the top of every dashboard section page so the three areas
// keep the same rhythm.
export default function DashboardPageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="rounded-3xl border border-border bg-peach/30 p-5 sm:p-6">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
          {eyebrow}
        </p>
      )}

      <h1 className="mt-2 font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
        {title}
      </h1>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      )}

      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
