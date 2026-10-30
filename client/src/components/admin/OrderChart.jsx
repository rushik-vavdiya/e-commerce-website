import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { monthKeyOf, orderMonthData, orderMonthKeys } from '../../utils/orderChart';

// Small, dependency-free orders chart for the admin dashboard: one month at a
// time, drawn as an area line over the days of that month — a point per day,
// the month's name under the axis. The header pages month to month and can
// jump back to the current month from anywhere.
//
// The SVG is sized from the card's measured width (ResizeObserver) instead of
// a stretched viewBox, so the stroke, dots and day labels keep their intended
// size at every card width instead of scaling with the container.
const PLOT = { top: 18, left: 38, right: 12, height: 176, bottom: 52 };
const BASELINE = PLOT.top + PLOT.height;
const CHART_HEIGHT = BASELINE + PLOT.bottom;

// Same pill the rest of the admin area uses for one-of controls.
const pillClass =
  'rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent';

export default function OrderChart({ orders = [], loading = false }) {
  // Hooks first: the loading and empty branches below return early, so every
  // hook has to run unconditionally to keep the hook order stable.
  const currentKey = useMemo(() => monthKeyOf(), []);
  const monthKeys = useMemo(() => orderMonthKeys(orders), [orders]);
  const [selectedKey, setSelectedKey] = useState(currentKey);

  // The selection stays inside the range the data offers (the order list can
  // refetch under us, and the month rolls over while the page is open).
  const activeKey = monthKeys.includes(selectedKey) ? selectedKey : currentKey;
  const data = useMemo(() => orderMonthData(orders, activeKey), [orders, activeKey]);

  const plotRef = useRef(null);
  const [plotWidth, setPlotWidth] = useState(640);

  // The plot only exists once loading is done, so the observer is (re)bound
  // when that flips.
  useLayoutEffect(() => {
    const element = plotRef.current;
    if (!element) return undefined;

    const measure = () => setPlotWidth(Math.round(element.getBoundingClientRect().width));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-border bg-white shadow-sm" aria-busy="true">
        <div className="border-b border-border px-5 py-4">
          <div className="h-4 w-32 animate-pulse rounded-full bg-peach/40" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded-full bg-peach/30" />
        </div>
        <div className="px-5 py-6">
          <div className="h-56 animate-pulse rounded-2xl bg-peach/25" />
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-white p-5 text-center text-sm text-muted">
        No orders yet. Orders appear here as soon as a customer checks out.
      </div>
    );
  }

  const atFirst = activeKey === monthKeys[0];
  const atLast = activeKey === monthKeys[monthKeys.length - 1];
  const isCurrentMonth = activeKey === currentKey;

  const pageMonth = (direction) => {
    const next = monthKeys[monthKeys.indexOf(activeKey) + direction];
    if (next) setSelectedKey(next);
  };

  // Plot geometry: one point per calendar day, evenly spread, count scaled
  // against the month's busiest day (floor of 1 so an empty month draws a
  // flat line at zero instead of dividing by it).
  const plotW = Math.max(120, plotWidth - PLOT.left - PLOT.right);
  const scale = Math.max(1, data.maxCount);
  const points = data.days.map((day, index) => ({
    ...day,
    x: PLOT.left + (index / (data.days.length - 1)) * plotW,
    y: PLOT.top + PLOT.height * (1 - day.count / scale),
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${BASELINE} L${points[0].x.toFixed(1)},${BASELINE} Z`;

  // Keep every day label only while ~34px each fits; past that, show every
  // nth day plus the last one, so 31 labels never collide on a narrow card.
  const labelEvery = Math.max(1, Math.ceil(data.days.length / Math.max(2, Math.floor(plotW / 34))));

  return (
    <section className="rounded-3xl border border-border bg-white shadow-sm" aria-label="Orders chart">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-medium text-primary">Orders</h2>
          <p className="mt-0.5 text-xs text-muted">
            Orders this month. Each point is how many orders arrived that day.
          </p>
        </div>

        {/* Month paging: the arrows walk the months that hold orders, and
            "This month" jumps back to the current month from anywhere. */}
        <div className="flex flex-wrap items-center gap-2">
          {!isCurrentMonth && (
            <button type="button" className={pillClass} onClick={() => setSelectedKey(currentKey)}>
              This month
            </button>
          )}

          <div className="flex items-center gap-1 rounded-full border border-border bg-white px-1.5 py-1">
            <button
              type="button"
              onClick={() => pageMonth(-1)}
              disabled={atFirst}
              aria-label="Previous month"
              className="inline-flex size-7 items-center justify-center rounded-full text-primary transition-colors hover:bg-peach/40 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>

            <span className="min-w-[112px] px-1 text-center text-xs font-medium text-primary" aria-live="polite">
              {data.monthLabel}
            </span>

            <button
              type="button"
              onClick={() => pageMonth(1)}
              disabled={atLast}
              aria-label="Next month"
              className="inline-flex size-7 items-center justify-center rounded-full text-primary transition-colors hover:bg-peach/40 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2 px-5 py-4">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Daily</p>

        <div ref={plotRef} className="w-full">
          <svg
            viewBox={`0 0 ${plotWidth} ${CHART_HEIGHT}`}
            width="100%"
            height={CHART_HEIGHT}
            className="block overflow-visible"
            role="img"
            aria-label={`${data.monthLabel}: ${data.orderCount} order${data.orderCount === 1 ? '' : 's'}`}
          >
            <defs>
              <linearGradient id="ordersAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.30" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal gridlines with the count at their left. */}
            {data.ticks.map((tick) => {
              const y = PLOT.top + PLOT.height * (1 - tick / scale);

              return (
                <g key={tick}>
                  <line x1={PLOT.left} y1={y} x2={PLOT.left + plotW} y2={y} className="stroke-border" strokeWidth="1" />
                  <text x={PLOT.left - 8} y={y + 3.5} textAnchor="end" className="fill-muted text-[10px]">
                    {tick.toLocaleString('en-IN')}
                  </text>
                </g>
              );
            })}

            {/* The line itself: filled area under it, then the stroke, then a
                dot per day with a native tooltip carrying that day's count. */}
            <path d={areaPath} fill="url(#ordersAreaFill)" />
            <path d={linePath} fill="none" className="stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {points.map((point) => (
              <circle key={point.dayKey} cx={point.x} cy={point.y} r="3" className="fill-accent stroke-white" strokeWidth="1.5">
                <title>{`${point.label} ${data.axisLabel}: ${point.count} order${point.count === 1 ? '' : 's'}`}</title>
              </circle>
            ))}

            {/* Day ordinals along the axis, thinned to what fits, then the
                month under them the way the reference chart labels it. */}
            {points.map((point, index) =>
              index % labelEvery === 0 || index === points.length - 1 ? (
                <text key={point.dayKey} x={point.x} y={BASELINE + 18} textAnchor="middle" className="fill-muted text-[10px]">
                  {point.label}
                </text>
              ) : null,
            )}

            <text x={PLOT.left + plotW / 2} y={BASELINE + 38} textAnchor="middle" className="fill-primary text-[11px] font-medium">
              {data.axisLabel}
            </text>

            {data.orderCount === 0 && (
              <text x={PLOT.left + plotW / 2} y={PLOT.top + PLOT.height / 2} textAnchor="middle" className="fill-muted text-[12px]">
                No orders in {data.monthLabel} yet
              </text>
            )}
          </svg>
        </div>
      </div>
    </section>
  );
}