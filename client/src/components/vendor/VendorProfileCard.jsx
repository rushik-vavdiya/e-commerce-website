import { Mail, MapPin, Phone, Store } from 'lucide-react';

import StatusPill from '../dashboard/StatusPill';
import { formatDate } from '../../utils/format';

// Store profile straight from GET /vendors/me, plus the account fields from the
// auth slice. Nothing here is editable — the edit form is a separate component so
// the read-only and edit states stay clear.
export default function VendorProfileCard({ vendor, user = null, loading = false, error = null }) {
  if (loading) {
    return (
      <section className="rounded-3xl border border-border bg-white p-5 sm:p-6" aria-busy="true">
        <div className="h-5 w-40 animate-pulse rounded-full bg-peach/50" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-xl bg-peach/30" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 sm:p-6">
        {error}
      </section>
    );
  }

  if (!vendor) {
    return (
      <section className="rounded-3xl border border-dashed border-border bg-white p-5 text-sm text-muted sm:p-6">
        No store record was returned for this account.
      </section>
    );
  }

  const socials = Object.entries(vendor.storeSocial ?? {}).filter(([, value]) => Boolean(value));

  return (
    <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-peach bg-peach/40 text-primary"
          >
            <Store size={20} strokeWidth={1.7} />
          </span>

          <div className="min-w-0">
            <h2 className="truncate text-base font-medium text-primary">{vendor.storeName}</h2>
            <p className="mt-0.5 text-xs text-muted">
              Store record created{' '}
              {formatDate(vendor.createdAt) || '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill value={vendor.approvalStatus} label={`application ${vendor.approvalStatus}`} />
          <StatusPill value={vendor.status} label={`store ${vendor.status}`} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">{vendor.storeDescription}</p>

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

      {socials.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {socials.map(([name, href]) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-8 items-center rounded-full border border-border px-3 text-[11px] font-medium capitalize text-primary transition-colors hover:border-accent hover:text-accent"
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      )}

      {user && (
        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted">Account name</dt>
            <dd className="mt-0.5 font-medium text-primary">
              {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Account email</dt>
            <dd className="mt-0.5 break-all font-medium text-primary">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Account status</dt>
            <dd className="mt-0.5 font-medium text-primary">
              {user.status ?? '—'}
              {user.emailVerified ? ' · email verified' : ' · email not verified'}
            </dd>
          </div>
        </dl>
      )}

      {vendor.status !== 'active' && (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          Your store is <span className="font-semibold">{vendor.status}</span>. While it is
          not active the products API refuses vendor requests, so product listing and
          creation will fail until an admin approves the application (or reactivates the
          store).
        </p>
      )}
    </section>
  );
}
