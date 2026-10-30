import Order from "./order.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Admin lists can be narrowed by the two statuses and by order number. Without
// filters the newest 200 orders are returned.
const buildOrderFilter = (filters = {}) => {
  const query = {};

  if (filters.orderStatus) query.orderStatus = filters.orderStatus;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.search) {
    query.orderNumber = { $regex: escapeRegex(String(filters.search)), $options: "i" };
  }

  return query;
};

export const orderRepository = {
  create: (data) => Order.create(data),
  findById: (orderId) => Order.findById(orderId),
  findByIdempotencyKey: (userId, idempotencyKey) => Order.findOne({ userId, idempotencyKey }),
  findForUser: (orderId, userId) => Order.findOne({ _id: orderId, userId }),
  listForUser: (userId) => Order.find({ userId }).sort({ createdAt: -1 }).limit(100),
  listAll: (filters = {}) =>
    Order.find(buildOrderFilter(filters)).sort({ createdAt: -1 }).limit(200),

  // Every status change records itself in statusHistory in the same write, so a
  // timestamp can never be missing from the timeline. The filter makes the
  // change conditional: a second request for the same transition updates
  // nothing instead of applying it twice.
  changeStatus: (orderId, filter, update) => {
    const changes = { $set: update };

    if (typeof update.orderStatus === "string") {
      changes.$push = {
        statusHistory: {
          status: update.orderStatus,
          at: new Date(),
          note: update.statusNote ?? null,
        },
      };
      delete update.statusNote;
    }

    return Order.findOneAndUpdate(
      { _id: orderId, ...filter },
      changes,
      { new: true, runValidators: true },
    );
  },

  updateFields: (orderId, update) =>
    Order.findByIdAndUpdate(
      orderId,
      { $set: update },
      { new: true, runValidators: true },
    ),

  delete: (orderId) => Order.findByIdAndDelete(orderId),
};
