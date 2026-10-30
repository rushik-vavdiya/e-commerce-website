// Data for the admin Orders chart: one month at a time, bucketed per calendar
// day. The component picks a month, and this module turns the raw order list
// into that month's series plus the list of months it may page through.

// 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", 11 → "11th", 21 → "21st" —
// the day labels under the axis.
export const ordinalDay = (dayNumber) => {
  const remainder = dayNumber % 100;
  const suffix =
    remainder >= 11 && remainder <= 13
      ? 'th'
      : { 1: 'st', 2: 'nd', 3: 'rd' }[remainder % 10] ?? 'th';

  return `${dayNumber}${suffix}`;
};

// "YYYY-MM" for a date, defaulting to the month we are in right now.
export const monthKeyOf = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const parseMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month };
};

// Every month the chart can show: each month an order landed in, plus the
// current month so "this month" is always reachable — even before the first
// order of the month arrives. Ascending, and "YYYY-MM" sorts chronologically.
export const orderMonthKeys = (orders = []) => {
  const keys = new Set([monthKeyOf()]);

  for (const order of orders) {
    if (!order?.createdAt) continue;
    keys.add(monthKeyOf(new Date(order.createdAt)));
  }

  return [...keys].sort();
};

// Whole-number y-axis labels: every value up to four (orders are small counts
// and each one is worth seeing), otherwise 0 / half / max.
const axisTicks = (maxCount) => {
  if (maxCount <= 4) return Array.from({ length: maxCount + 1 }, (_, index) => index);
  return [...new Set([0, Math.ceil(maxCount / 2), maxCount])];
};

// One month of orders:
//   { monthKey, monthLabel, axisLabel, orderCount, maxCount, ticks,
//     days: [{ dayKey, day, label, count }] }
// Every calendar day is present (empty ones included) so the line keeps the
// shape of the whole month instead of collapsing around the days that sold.
export const orderMonthData = (orders = [], monthKey) => {
  const { year, month } = parseMonthKey(monthKey);
  const daysInMonth = new Date(year, month, 0).getDate();
  const counts = new Map();

  for (const order of orders) {
    if (!order?.createdAt) continue;

    const created = new Date(order.createdAt);
    if (monthKeyOf(created) !== monthKey) continue;

    const day = created.getDate();
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      dayKey: `${monthKey}-${String(day).padStart(2, '0')}`,
      day,
      label: ordinalDay(day),
      count: counts.get(day) ?? 0,
    };
  });

  const orderCount = days.reduce((total, day) => total + day.count, 0);
  const maxCount = days.reduce((highest, day) => Math.max(highest, day.count), 0);

  const start = new Date(year, month - 1, 1);

  return {
    monthKey,
    // "October 2026" for the card header, "Oct '26" under the axis.
    monthLabel: start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    axisLabel: `${start.toLocaleDateString('en-IN', { month: 'short' })} '${String(year).slice(2)}`,
    orderCount,
    maxCount,
    ticks: axisTicks(maxCount),
    days,
  };
};