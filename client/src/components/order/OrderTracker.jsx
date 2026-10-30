import { Truck } from 'lucide-react';

import OrderProgress from './OrderProgress';
import StatusPill from '../dashboard/StatusPill';
import { formatDateTime } from '../../utils/format';
import { orderStages, orderTimeline, stageIndex, statusLabel } from '../../utils/orders';

// Visual progress for one order.
//
// The steps come from orderStages(); a step is marked done only when the backend
// status has reached it, and the current step is the one the order is sitting on.
// "Cancelled", "returned" and the refund states are not steps, so a closed order
// keeps the rail up to the last stage it reached and explains the ending in a note
// instead of pretending the parcel moved on.
const CLOSED_STATUSES = ['cancelled', 'returned'];

export default function OrderTracker({ order }) {
  const timeline = orderTimeline(order);
  const stages = orderStages(order);
  const timeFor = (status) => timeline.find((event) => event.status === status)?.at ?? null;
  const currentIndex = stageIndex(order?.orderStatus);
  const closed = CLOSED_STATUSES.includes(order?.orderStatus);

  // A cancelled order is no longer sitting on a stage, so its rail stops at the
  // furthest stage its history shows instead of resetting to nothing.
  const reachedIndex = timeline.reduce(
    (furthest, event) => Math.max(furthest, stageIndex(event.status)),
    currentIndex,
  );

  const hasTracking = Boolean(order?.trackingNumber || order?.courierName);
  const hasHistory = timeline.length > 1;

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-medium text-primary">Order tracking</h2>
          <p className="mt-0.5 text-xs text-muted">
            Steps update as the order moves through the studio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill value={order?.orderStatus} label={statusLabel(order?.orderStatus)} />
          <StatusPill value={order?.paymentStatus} label={statusLabel(order?.paymentStatus)} />
        </div>
      </header>

      <div className="px-5 py-6 sm:px-6">
        {closed && (
          <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
            {order.orderStatus === 'returned'
              ? 'This order was returned. Refunds appear on the payment status once the studio confirms them.'
              : 'This order was cancelled and its items went back into stock.'}
            {order.cancelledAt ? ` Cancelled on ${formatDateTime(order.cancelledAt)}.` : ''}
          </p>
        )}

        <OrderProgress
          stages={stages}
          currentIndex={closed ? reachedIndex : currentIndex}
          stopped={closed}
          timeFor={timeFor}
        />
      </div>

      {(hasTracking || hasHistory) && (
        <footer
          className={[
            'grid gap-4 border-t border-border bg-background/50 px-5 py-4 sm:px-6',
            hasTracking && hasHistory ? 'sm:grid-cols-2 sm:gap-6' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {hasTracking && (
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-peach/50 text-primary"
              >
                <Truck size={17} strokeWidth={1.8} />
              </span>

              <div className="min-w-0 text-sm">
                {order.courierName && (
                  <p className="font-medium text-primary">{order.courierName}</p>
                )}
                {order.trackingNumber && (
                  <p className="mt-0.5 break-all text-xs text-muted">
                    Tracking number {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>
          )}

          {hasHistory && (
            <details className="sm:justify-self-end">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Status history
              </summary>

              <ul className="mt-3 flex flex-col gap-2">
                {timeline.map((event, index) => (
                  <li
                    key={`${event.status}-${index}`}
                    className="flex flex-wrap justify-between gap-2 text-xs"
                  >
                    <span className="font-medium text-primary">
                      {statusLabel(event.status)}
                      {event.note ? ` — ${event.note}` : ''}
                    </span>
                    <span className="text-muted">{formatDateTime(event.at)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </footer>
      )}
    </section>
  );
}
