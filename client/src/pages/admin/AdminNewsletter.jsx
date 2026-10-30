import { useEffect, useState } from 'react';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import ProductPagination from '../../components/product/ProductPagination';
import { ADMIN_PAGE_SIZE, clampPage, pageCount, pageSlice } from '../../utils/pagination';
import { getNewsletterSubscribers } from '../../services/newsletterService';
import { formatDateTime } from '../../utils/format';



export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // The subscriber list comes back in one response (newest 500), so the table
  // is paged in the browser.
  const pages = pageCount(subscribers.length);
  const activePage = clampPage(page, pages);
  const pageRows = pageSlice(subscribers, activePage);

  useEffect(() => {
    let active = true;

    const loadSubscribers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getNewsletterSubscribers();
        if (active) setSubscribers(response.data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              'Could not load newsletter subscribers.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSubscribers();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Audience"
        title="Newsletter subscribers"
        description={`${subscribers.length} subscribers loaded (newest 500).`}
      />

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-3xl border border-border bg-white/60"
            />
          ))}
        </div>
      ) : error ? (
        <p
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </p>
      ) : subscribers.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
          No newsletter subscribers yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-3xl border border-border bg-white">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-muted">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Email
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Subscribed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRows.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td className="break-all px-5 py-4 font-medium text-primary">
                      {subscriber.email}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted">
                      {formatDateTime(subscriber.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ProductPagination
            label="Subscriber pages"
            page={activePage}
            pages={pages}
            total={subscribers.length}
            limit={ADMIN_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
