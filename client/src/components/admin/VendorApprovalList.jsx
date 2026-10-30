import { useState } from 'react';
import { Check, Clock, Mail, MapPin, Phone, X } from 'lucide-react';

import StatusPill from '../dashboard/StatusPill';
import { formatDate } from '../../utils/format';

// Vendor applications from GET /vendors with the approve / reject / under-review
// actions the backend exposes. Approving also gives that account the vendor role
// (server/src/modules/vendor/vendor.repository.js), so the copy says so.
export default function VendorApprovalList({
  vendors = [],
  loading = false,
  error = null,
  onReview,
  busyId = null,
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-border bg-white/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (vendors.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
        No vendor applications yet. Applications arrive from POST /vendors when a
        customer applies to sell.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {vendors.map((vendor) => {
        const busy = busyId === vendor._id;
        const rejecting = rejectingId === vendor._id;

        return (
          <li
            key={vendor._id}
            className="rounded-3xl border border-border bg-white p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-medium text-primary">
                  {vendor.storeName}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusPill value={vendor.approvalStatus} />
                  <StatusPill value={vendor.status} label={`store ${vendor.status}`} />
                  <span className="text-xs text-muted">
                    Applied {formatDate(vendor.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy || vendor.approvalStatus === 'under_review'}
                  onClick={() => onReview?.(vendor._id, 'under_review')}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Clock size={14} strokeWidth={1.9} aria-hidden="true" />
                  Under review
                </button>

                <button
                  type="button"
                  disabled={busy || vendor.approvalStatus === 'approved'}
                  onClick={() => onReview?.(vendor._id, 'approved')}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                  Approve
                </button>

                <button
                  type="button"
                  disabled={busy || vendor.approvalStatus === 'rejected'}
                  onClick={() => {
                    setRejectingId(rejecting ? null : vendor._id);
                    setReason('');
                  }}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                  Reject
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-muted">
              {vendor.storeDescription}
            </p>

            <ul className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <Mail size={14} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="break-all">{vendor.storeEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={14} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>{vendor.storeContact}</span>
              </li>
              <li className="flex items-start gap-2 sm:col-span-2">
                <MapPin size={14} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>{vendor.storeAddress}</span>
              </li>
            </ul>

            {vendor.approvalStatus === 'rejected' && vendor.rejectionReason && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                Rejection reason: {vendor.rejectionReason}
              </p>
            )}

            <p className="mt-4 text-xs text-muted">
              Approving this application also switches the account role to vendor.
            </p>

            {rejecting && (
              <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                <label
                  htmlFor={`rejection-${vendor._id}`}
                  className="text-xs font-medium text-primary"
                >
                  Rejection reason (required by the API)
                </label>

                <textarea
                  id={`rejection-${vendor._id}`}
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="For example: store documents are incomplete."
                  className="mt-2 w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || reason.trim().length === 0}
                    onClick={() => {
                      onReview?.(vendor._id, 'rejected', reason.trim());
                      setRejectingId(null);
                      setReason('');
                    }}
                    className="inline-flex min-h-9 items-center rounded-full bg-red-700 px-4 text-xs font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Confirm rejection
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRejectingId(null);
                      setReason('');
                    }}
                    className="inline-flex min-h-9 items-center rounded-full px-4 text-xs font-medium text-muted transition-colors hover:text-primary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
