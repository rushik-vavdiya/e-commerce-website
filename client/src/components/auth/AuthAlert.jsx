import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';

const styles = {
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-700',
    Icon: TriangleAlert,
    role: 'alert',
  },
  success: {
    wrapper: 'border-accent/30 bg-peach/40 text-primary',
    Icon: CheckCircle2,
    role: 'status',
  },
  info: {
    wrapper: 'border-border bg-background text-primary',
    Icon: Info,
    role: 'status',
  },
};

// Small message box shared by every auth form.
export default function AuthAlert({ variant = 'error', children, className = '' }) {
  if (!children) return null;

  const { wrapper, Icon, role } = styles[variant] ?? styles.error;

  return (
    <div
      role={role}
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${wrapper} ${className}`}
    >
      <Icon size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span className="leading-6">{children}</span>
    </div>
  );
}
