// Order status rules shared by the customer and admin screens. They mirror
// server/src/modules/order/order.service.js, so the buttons only offer status
// changes the backend accepts.
const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export const nextOrderStatuses = (status) => TRANSITIONS[status] ?? [];

// The seven steps shown on the tracking timeline, in order. "cancelled",
// "returned" and the refund states are shown as a note instead of a step.
export const ORDER_STAGES = [
  { status: 'pending', label: 'Order placed' },
  { status: 'confirmed', label: 'Payment confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'packed', label: 'Packed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'out_for_delivery', label: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered' },
];

// A cash on delivery order is confirmed without any money moving, so calling
// that step "Payment confirmed" would claim a payment that never happened.
export const orderStages = (order) =>
  order?.paymentMethod === 'cod'
    ? ORDER_STAGES.map((stage) =>
        stage.status === 'confirmed' ? { ...stage, label: 'Order confirmed' } : stage,
      )
    : ORDER_STAGES;

export const ORDER_STATUS_LABELS = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  unpaid: 'Unpaid',
  paid: 'Paid',
  failed: 'Payment failed',
  partially_refunded: 'Partly refunded',
  refunded: 'Refunded',
};

export const statusLabel = (value) =>
  ORDER_STATUS_LABELS[value] ?? String(value ?? '').replace(/_/g, ' ');

// A paid order has to be refunded by the studio before it can be cancelled, which
// the backend rejects. Only pending/confirmed orders still awaiting money can be
// cancelled from the customer side.
export const canCancelOrder = (order) =>
  ['pending', 'confirmed'].includes(order?.orderStatus) &&
  ['unpaid', 'failed'].includes(order?.paymentStatus);

// Retry is offered while the order is still waiting for its money and the
// payment is not already captured. Cash on delivery never needs one.
export const canRetryPayment = (order) =>
  order?.paymentMethod !== 'cod' &&
  order?.orderStatus === 'pending' &&
  ['unpaid', 'failed', 'pending'].includes(order?.paymentStatus);

// Newest step first is easier to read in a list, but the timeline runs top-down
// in order, so the index is what the tracker uses.
export const stageIndex = (status) =>
  ORDER_STAGES.findIndex((stage) => stage.status === status);

// History comes from the backend (statusHistory). Older orders placed before the
// timeline existed fall back to the one timestamp every order has.
export const orderTimeline = (order) => {
  const history = Array.isArray(order?.statusHistory) ? order.statusHistory : [];

  if (history.length > 0) {
    return [...history].sort((first, second) => new Date(first.at) - new Date(second.at));
  }

  return [
    {
      status: order?.orderStatus ?? 'pending',
      at: order?.placedAt ?? order?.createdAt ?? null,
      note: null,
    },
  ];
};
