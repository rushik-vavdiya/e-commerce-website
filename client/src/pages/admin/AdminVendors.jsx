import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import ProductPagination from '../../components/product/ProductPagination';
import VendorApprovalList from '../../components/admin/VendorApprovalList';
import { ADMIN_PAGE_SIZE, clampPage, pageCount, pageSlice } from '../../utils/pagination';
import { fetchVendors, reviewVendorApplication } from '../../slices/vendorSlice';

const FILTERS = ['all', 'pending', 'under_review', 'approved', 'rejected'];

// Vendor approval management from GET /vendors and PATCH /vendors/:id/review.
// Approving an application also switches that account's role to vendor.
export default function AdminVendors() {
  const dispatch = useDispatch();
  const vendor = useSelector((state) => state.vendor);

  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const visible =
    filter === 'all'
      ? vendor.items
      : vendor.items.filter((item) => item.approvalStatus === filter);

  // Paged in the browser over the filtered set; a new filter starts at page 1.
  const pages = pageCount(visible.length);
  const activePage = clampPage(page, pages);
  const pageItems = pageSlice(visible, activePage);

  const selectFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const countOf = (status) =>
    vendor.items.filter((item) => item.approvalStatus === status).length;

  const handleReview = async (vendorId, approvalStatus, rejectionReason) => {
    setBusyId(vendorId);
    setNotice(null);

    try {
      await dispatch(
        reviewVendorApplication({ vendorId, approvalStatus, rejectionReason }),
      ).unwrap();
      setNotice({
        tone: 'success',
        text:
          approvalStatus === 'approved'
            ? 'Vendor approved. The account role is now vendor.'
            : `Application marked ${approvalStatus}.`,
      });
      await dispatch(fetchVendors());
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Marketplace"
        title="Vendor approval management"
        description="Applications submitted through POST /vendors. Approving gives the account the vendor role, so it can create products."
      />

      <ul className="flex flex-wrap items-center gap-2">
        {FILTERS.map((value) => (
          <li key={value}>
            <button
              type="button"
              onClick={() => selectFilter(value)}
              aria-pressed={filter === value}
              className={[
                'inline-flex min-h-9 items-center rounded-full border px-4 text-xs font-medium capitalize transition-colors',
                filter === value
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-primary hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              {value.replace(/_/g, ' ')}
              <span className="ml-2 text-[10px] opacity-80">
                {value === 'all' ? vendor.items.length : countOf(value)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {notice && (
        <p
          role={notice.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      <VendorApprovalList
        vendors={pageItems}
        loading={vendor.loading && vendor.items.length === 0}
        error={vendor.items.length === 0 ? vendor.error : null}
        onReview={handleReview}
        busyId={busyId}
      />

      <ProductPagination
        label="Vendor application pages"
        page={activePage}
        pages={pages}
        total={visible.length}
        limit={ADMIN_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
