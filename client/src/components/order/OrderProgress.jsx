import {
  BadgeCheck,
  Box,
  Navigation,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';

import { formatDateTime } from '../../utils/format';

// One icon per step, so the tracker reads at a glance and never needs numbers.
// A stage that is not in this map (a future status) falls back to a parcel icon.
const STAGE_ICONS = {
  pending: ShoppingBag,
  confirmed: BadgeCheck,
  processing: Package,
  packed: Box,
  shipped: Truck,
  out_for_delivery: Navigation,
  delivered: PackageCheck,
};

// Horizontal progress rail for the order detail page: every stage in one row,
// joined by a connector, with the icon, the label and when it happened.
//
// `currentIndex` is the furthest stage the order has reached (-1 when it has not
// started). `stopped` marks a cancelled/returned order: its rail keeps the stages
// it did reach, and the last of them is drawn in the closed colour instead of the
// "in progress" one.
export default function OrderProgress({
  stages = [],
  currentIndex = -1,
  stopped = false,
  timeFor = () => null,
}) {
  if (stages.length === 0) return null;

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
      <ol
        aria-label="Order progress"
        className="flex min-w-[560px] items-start sm:min-w-0"
      >
        {stages.map((stage, index) => {
          const Icon = STAGE_ICONS[stage.status] ?? Package;
          const reached = index <= currentIndex;
          const current = index === currentIndex;
          const terminal = stopped && current;
          const at = timeFor(stage.status);

          const meta = terminal
            ? 'Stopped here'
            : !reached
              ? 'Waiting'
              : current
                ? at
                  ? `Now · ${formatDateTime(at)}`
                  : 'Now'
                : at
                  ? formatDateTime(at)
                  : 'Done';

          return (
            <li
              key={stage.status}
              aria-current={current ? 'step' : undefined}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              {/* Connector from the previous step. Coloured per step so the rail
                  shows exactly how far the parcel has travelled. */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={[
                    'absolute left-0 top-5 h-0.5 w-1/2 -translate-y-1/2',
                    reached
                      ? terminal
                        ? 'bg-red-200'
                        : 'bg-primary/45'
                      : 'bg-border',
                  ].join(' ')}
                />
              )}

              <span
                aria-hidden="true"
                className={[
                  'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  terminal
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : current
                      ? 'border-primary bg-primary text-white ring-4 ring-accent/15'
                      : reached
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border bg-white text-muted/70',
                ].join(' ')}
              >
                <Icon size={17} strokeWidth={1.9} />
              </span>

              <span
                className={[
                  'mt-3 min-h-[2.4rem] px-1 text-[11px] leading-4 sm:text-xs',
                  current && !terminal
                    ? 'font-semibold text-primary'
                    : reached
                      ? 'font-medium text-primary'
                      : 'text-muted',
                ].join(' ')}
              >
                {stage.label}
              </span>

              <span
                className={[
                  'mt-0.5 px-1 text-[10px] leading-4',
                  terminal ? 'font-medium text-red-600' : 'text-muted',
                ].join(' ')}
              >
                {meta}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
