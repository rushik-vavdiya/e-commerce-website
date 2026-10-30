import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, ShieldCheck } from 'lucide-react';

import VendorApplicationStatus from '../../components/vendor/VendorApplicationStatus';
import VendorPreviewHeader from '../../components/vendor/VendorPreviewHeader';
import VendorPreviewNav from '../../components/vendor/VendorPreviewNav';
import VendorProductForm from '../../components/vendor/VendorProductForm';
import VendorProductList from '../../components/vendor/VendorProductList';
import VendorProfileCard from '../../components/vendor/VendorProfileCard';
import VendorReviewList from '../../components/vendor/VendorReviewList';
import VendorStats from '../../components/vendor/VendorStats';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import {
  PREVIEW_NOTICE,
  demoPreviewCategories,
  demoPreviewProducts,
  demoPreviewReviewGroups,
  demoPreviewUser,
  demoPreviewVendor,
} from '../../data/vendorPreviewData';

// /vendor-preview — a public, read-only inspection of the vendor dashboard UI.
//
// Security notes that keep this route safe:
// - It imports no auth or API state, dispatches nothing and sends no request.
// - Every screen is driven by src/data/vendorPreviewData.js (clearly demo rows).
// - The forms are rendered with a rejecting submit, so no action can appear to
//   succeed and nothing can reach the real endpoints.
// - The section switcher uses buttons, not links to /vendor/*, so the preview
//   never navigates into the protected area.
export default function VendorPreview() {
  const [section, setSection] = useState('.');

  const categoryById = new Map(
    demoPreviewCategories.map((category) => [String(category._id), category]),
  );

  const previewOnlySubmit = () =>
    Promise.reject(
      new Error(
        'Preview only: saving is disabled here. The real forms post to the API with your own vendor token.',
      ),
    );

  return (
    <div className="min-h-screen bg-background">
      <VendorPreviewHeader />

      <div className="mx-auto flex w-full max-w-[1900px] flex-col gap-6 px-5 py-6 sm:px-8 lg:flex-row lg:px-10 lg:py-8">
        <div className="lg:w-60 lg:shrink-0">
          <VendorPreviewNav active={section} onChange={setSection} />
        </div>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <div
            role="note"
            className="rounded-3xl border border-dashed border-peach bg-peach/25 px-5 py-4"
          >
            <p className="flex items-start gap-3 text-xs leading-5 text-muted sm:text-[13px] sm:leading-6">
              <Info size={18} strokeWidth={1.7} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <span>
                <span className="font-semibold text-primary">Vendor preview.</span>{' '}
                {PREVIEW_NOTICE}
              </span>
            </p>
          </div>

          {section === '.' && (
            <>
              <DashboardPageHeader
                eyebrow="Your store"
                title="Vendor dashboard overview"
                description="How the overview looks with a store record, a product list and store statistics in place."
              />

              <VendorStats products={demoPreviewProducts} />

              <div className="grid gap-6 xl:grid-cols-2">
                <VendorProfileCard vendor={demoPreviewVendor} user={demoPreviewUser} />
                <VendorApplicationStatus vendor={demoPreviewVendor} demo />
              </div>

              <section className="flex flex-col gap-4">
                <h2 className="text-base font-medium text-primary">Your products</h2>
                <VendorProductList
                  products={demoPreviewProducts}
                  categoryById={categoryById}
                  editable={false}
                />
              </section>
            </>
          )}

          {section === 'products' && (
            <>
              <DashboardPageHeader
                eyebrow="Inventory"
                title="Product management"
                description="The product list with draft, published and out-of-stock states."
              />

              <VendorProductList
                products={demoPreviewProducts}
                categoryById={categoryById}
                onDelete={() => {}}
              />
            </>
          )}

          {section === 'products/new' && (
            <>
              <DashboardPageHeader
                eyebrow="Inventory"
                title="Add product"
                description="The real form, pre-filled and wired to a submit that refuses to save in the preview."
              />

              <div
                role="note"
                className="rounded-3xl border border-dashed border-peach bg-peach/25 px-5 py-4 text-xs leading-5 text-muted"
              >
                The form below is the live component. Submitting it here shows the
                “saving is disabled” message instead of calling POST /products.
              </div>

              <VendorProductForm
                initial={demoPreviewProducts[0]}
                categories={demoPreviewCategories}
                onSubmit={previewOnlySubmit}
              />
            </>
          )}

          {section === 'reviews' && (
            <>
              <DashboardPageHeader
                eyebrow="Feedback"
                title="Product reviews"
                description="How approved customer reviews are listed for a product."
              />

              <VendorReviewList groups={demoPreviewReviewGroups} />
            </>
          )}

          {section === 'profile' && (
            <>
              <DashboardPageHeader
                eyebrow="Your store"
                title="Store profile"
                description="The read-only store record and the application status panel."
              />

              <div className="grid gap-6 xl:grid-cols-2">
                <VendorProfileCard vendor={demoPreviewVendor} user={demoPreviewUser} />
                <VendorApplicationStatus vendor={demoPreviewVendor} demo />
              </div>
            </>
          )}

          {section === 'settings' && (
            <>
              <DashboardPageHeader
                eyebrow="Account"
                title="Account settings"
                description="This section reuses the customer profile components, so it needs a real session to show a real account."
              />

              <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
                <p className="flex items-start gap-3 text-sm leading-6 text-muted">
                  <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    The account settings section renders the same{' '}
                    <span className="font-medium text-primary">ProfileForm</span> and{' '}
                    <span className="font-medium text-primary">ChangePasswordForm</span>{' '}
                    components used at{' '}
                    <Link to="/account" className="font-medium text-accent hover:underline">
                      /account
                    </Link>
                    . They read GET /users/me and PATCH /auth/change-password with
                    the signed-in token, so the preview does not render them with
                    demo values — doing so would put a fake email address and a fake
                    password form in front of you.
                  </span>
                </p>

                <p className="mt-4 text-xs leading-5 text-muted">
                  Sign in and open{' '}
                  <Link to="/vendor/settings" className="font-medium text-accent hover:underline">
                    /vendor/settings
                  </Link>{' '}
                  (an approved vendor account) to inspect the real section.
                </p>
              </div>
            </>
          )}

          <p className="pb-4 text-xs text-muted">
            Preview route is public by design and separate from{' '}
            <span className="font-medium text-primary">/vendor</span>, which stays
            behind the vendor role check. Real product creation, editing, order
            access and vendor account operations all still require an approved
            vendor session.
          </p>
        </main>
      </div>
    </div>
  );
}
