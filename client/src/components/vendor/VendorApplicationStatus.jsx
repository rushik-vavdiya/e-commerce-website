import { Check, Clock, X } from 'lucide-react';

import StatusPill from '../dashboard/StatusPill';

const STEPS = [
  { id: 'pending', label: 'Application received', hint: 'Submitted through POST /vendors.' },
  { id: 'under_review', label: 'Under review', hint: 'An admin is checking your store details.' },
  { id: 'decision', label: 'Decision', hint: 'Approved stores can list products; rejections include a reason.' },
];

const stepState = (approvalStatus, id) => {
  if (approvalStatus === 'approved') return id === 'decision' ? 'done' : 'done';
  if (approvalStatus === 'rejected') return id === 'decision' ? 'failed' : 'done';
  if (approvalStatus === 'under_review') return id === 'pending' ? 'done' : id === 'under_review' ? 'current' : 'todo';
  return id === 'pending' ? 'current' : 'todo';
};

const iconFor = (state) => {
  if (state === 'done') return <Check size={14} strokeWidth={2.2} aria-hidden="true" />;
  if (state === 'failed') return <X size={14} strokeWidth={2.2} aria-hidden="true" />;
  return <Clock size={14} strokeWidth={1.8} aria-hidden="true" />;
};

const toneFor = (state) => {
  if (state === 'done') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (state === 'failed') return 'bg-red-50 text-red-700 border-red-200';
  if (state === 'current') return 'bg-peach/50 text-primary border-peach';
  return 'bg-background text-muted border-border';
};

// Approval state of the store application. The status shown is exactly what
// GET /vendors/me returned; nothing here approves anything by itself.
export default function VendorApplicationStatus({ vendor, loading = false, demo = false }) {
  if (loading) {
    return (
      <section className="rounded-3xl border border-border bg-white p-5 sm:p-6" aria-busy="true">
        <div className="h-5 w-48 animate-pulse rounded-full bg-peach/50" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-2xl bg-peach/30" />
          ))}
        </div>
      </section>
    );
  }

  const approvalStatus = vendor?.approvalStatus ?? 'pending';

  return (
    <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-primary">Application status</h2>
          <p className="mt-0.5 text-xs text-muted">
            {demo
              ? 'Demo data — this panel is not connected to a real account.'
              : 'Returned by GET /vendors/me for this account.'}
          </p>
        </div>

        <StatusPill value={approvalStatus} label={`application ${approvalStatus}`} />
      </div>

      <ol className="mt-5 flex flex-col gap-3">
        {STEPS.map((step) => {
          const state = stepState(approvalStatus, step.id);

          return (
            <li key={step.id} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border ${toneFor(state)}`}
              >
                {iconFor(state)}
              </span>

              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">{step.label}</p>
                <p className="text-xs leading-5 text-muted">{step.hint}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {approvalStatus === 'rejected' && (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
          <span className="font-semibold">Rejection reason:</span>{' '}
          {vendor?.rejectionReason || 'No reason was recorded.'}
        </p>
      )}

      {approvalStatus === 'approved' && (
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
          Approved. Your store is active and can create products. Remember that a
          vendor-created product is saved as a draft and an admin publishes it.
        </p>
      )}

      {approvalStatus !== 'approved' && (
        <p className="mt-5 rounded-2xl border border-dashed border-peach bg-peach/25 px-4 py-3 text-xs leading-5 text-muted">
          A store that is not approved cannot create or read products: the products
          API answers 403 “Vendor account is not approved”. Only an admin can change
          this status.
        </p>
      )}
    </section>
  );
}
