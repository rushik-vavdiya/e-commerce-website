// Tiny status label. The dashboards show a lot of backend states (active,
// draft, pending, approved, shipped…), so the colour mapping lives here once.
const tones = {
  neutral: 'border-border bg-background text-muted',
  accent: 'border-peach bg-peach/40 text-primary',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

const toneFor = (value) => {
  const status = String(value ?? '').toLowerCase();

  if (['active', 'approved', 'delivered', 'paid', 'confirmed'].includes(status)) return 'success';
  if (['pending', 'under_review', 'processing', 'draft', 'unpaid', 'partially_refunded'].includes(status)) return 'warning';
  if (['inactive', 'suspended', 'rejected', 'cancelled', 'failed', 'returned', 'refunded'].includes(status)) return 'danger';
  if (['shipped', 'out_for_delivery'].includes(status)) return 'accent';

  return 'neutral';
};

export default function StatusPill({ value, label, tone, className = '' }) {
  const resolvedTone = tone ?? toneFor(value);
  const text = label ?? (String(value ?? '').replace(/_/g, ' ') || '—');

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize',
        tones[resolvedTone] ?? tones.neutral,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {text}
    </span>
  );
}
