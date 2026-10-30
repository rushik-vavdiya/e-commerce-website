import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Store } from 'lucide-react';

import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { useToast } from '../../components/notifications';
import VendorApplyHero from '../../components/vendor/VendorApplyHero';
import VendorApplyIntro from '../../components/vendor/VendorApplyIntro';
import VendorApplicationStatus from '../../components/vendor/VendorApplicationStatus';
import VendorStoreForm from '../../components/vendor/VendorStoreForm';
import { applyForVendor, fetchMyVendor } from '../../slices/vendorSlice';

// /vendor/apply — the customer-facing "Become a vendor" page. It is the only way
// into the vendor flow: POST /vendors creates the application, GET /vendors/me
// reports its status, and an admin decides from the admin area. Approving the
// application switches the account role to vendor on the server, which is what
// unlocks /vendor/*.
//
// The page is presentation only: the endpoint calls, the role checks and the
// "no application yet" handling below are unchanged.

// The API answers 404 "Vendor not found" for an account that has not applied, so
// that message means "no application yet" rather than a failure.
const NOT_APPLIED = 'Vendor not found';

export default function VendorApplication() {
  const dispatch = useDispatch();
  const toast = useToast();

  const user = useSelector((state) => state.auth.user);
  const { current, loading, error } = useSelector((state) => state.vendor);

  const [checked, setChecked] = useState(false);

  const isVendor = user?.role === 'vendor';
  const canApply = Boolean(user) && user?.role === 'customer';

  useEffect(() => {
    if (!canApply) return undefined;

    let active = true;
    // unwrap() rejects on a 404, which is expected here, so it is caught and the
    // slice keeps the message for the "not applied yet" branch below.
    dispatch(fetchMyVendor())
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [dispatch, canApply]);

  // A rejection is re-thrown on purpose: VendorStoreForm catches it and shows the
  // API message, and once the slice holds the new application this page swaps the
  // form for the status panel below.
  const handleApply = async (application) => {
    await dispatch(applyForVendor(application)).unwrap();

    // The form — and the notice it renders — disappear the moment the slice holds
    // the application, so the confirmation is raised as a notification instead.
    toast.success('Application sent. An admin will review it.');
  };

  const hasApplication = Boolean(current);
  const notAppliedYet = !hasApplication && error === NOT_APPLIED;
  const showForm = canApply && checked && (notAppliedYet || (!hasApplication && !error));

  return (
    <StorefrontLayout>
      <VendorApplyHero />

      {/* The form comes first: the hero's "Start your application" button lands
          here, so a visitor who already decided does not have to read past the
          benefits to reach it. The explanation follows underneath. */}
      <section id="vendor-apply" className="w-full scroll-mt-24 bg-white">
        <div className="mx-auto w-full max-w-[1900px] px-5 py-14 sm:px-8 lg:py-16">
          <header className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
              Application
            </p>

            <h2 className="mt-3 font-serif text-2xl font-medium leading-tight tracking-tight text-primary sm:text-3xl lg:text-[36px]">
              Apply to sell on Lunella
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted">
              The form below is saved with <span className="font-medium text-primary">POST /vendors</span>.
              You need a customer account, and an admin reviews what you send.
            </p>
          </header>

          <div className="mt-8 flex max-w-[820px] flex-col gap-5">
            {!user && (
              <div className="rounded-3xl border border-border bg-background p-6 text-center sm:p-8">
                <span
                  aria-hidden="true"
                  className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-white text-accent"
                >
                  <Store size={22} strokeWidth={1.6} />
                </span>

                <h3 className="mt-4 text-base font-medium text-primary">Sign in to apply</h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                  An application is tied to your account, so sign in first. Creating an
                  account takes a moment and stays free.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/login"
                    className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-white px-6 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            )}

            {isVendor && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6">
                <h3 className="text-base font-medium text-emerald-900">
                  This account already sells here
                </h3>

                <p className="mt-2 text-sm leading-6 text-emerald-900/85">
                  Your account has the vendor role, so an application is not needed.
                  Manage your store from the vendor dashboard.
                </p>

                <Link
                  to="/vendor"
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
                >
                  <LayoutDashboard size={16} strokeWidth={1.8} aria-hidden="true" />
                  Open vendor dashboard
                </Link>
              </div>
            )}

            {user && user.role !== 'customer' && user.role !== 'vendor' && (
              <div className="flex items-start gap-3 rounded-3xl border border-border bg-background px-5 py-5">
                <ShieldCheck
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-accent"
                />

                <p className="text-sm leading-6 text-muted">
                  Only a customer account can apply to sell. You are signed in with a
                  different role.
                </p>
              </div>
            )}

            {hasApplication && (
              <>
                <VendorApplicationStatus vendor={current} loading={false} />

                <p className="rounded-3xl border border-dashed border-border bg-background px-5 py-4 text-xs leading-5 text-muted">
                  Your application is already on file, so the form is closed — the API
                  refuses a second application for the same account. You can still edit
                  these details from your store profile once your account becomes a
                  vendor account.
                </p>
              </>
            )}

            {canApply && loading && !checked && (
              <div
                className="rounded-3xl border border-border bg-background p-5 sm:p-6"
                aria-busy="true"
              >
                <div className="h-5 w-40 animate-pulse rounded-full bg-peach/50" />
                <div className="mt-5 flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-11 animate-pulse rounded-xl bg-peach/30" />
                  ))}
                </div>
              </div>
            )}

            {canApply && checked && error && !notAppliedYet && (
              <p
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
              >
                {error}
              </p>
            )}

            {showForm && (
              <VendorStoreForm
                title="Vendor application"
                description="Required fields match the server validation, and an admin reads them while reviewing."
                submitLabel="Submit application"
                successMessage="Application sent. An admin will review it."
                onSubmit={handleApply}
                busy={loading}
                error={error && !notAppliedYet ? error : null}
              />
            )}
          </div>
        </div>
      </section>

      <VendorApplyIntro />
    </StorefrontLayout>
  );
}
