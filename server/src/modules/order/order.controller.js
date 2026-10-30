import {
  cancelOrder,
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  updateOrderTracking,
} from "./order.service.js";

export const createOrderController = async (req, res, next) => {
  try {
    const order = await createOrder(req.user.id, {
      ...req.body,
      idempotencyKey: req.get("Idempotency-Key") || req.body.idempotencyKey,
    });
    return res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (error) {
    return next(error);
  }
};

export const getOrdersController = async (req, res, next) => {
  try {
    const filters = req.validated?.query ?? {};
    const orders = await getOrders(req.user.id, req.user.role === "admin", filters);
    return res.status(200).json({ success: true, message: "Orders fetched", data: orders });
  } catch (error) {
    return next(error);
  }
};

export const getOrderController = async (req, res, next) => {
  try {
    const order = await getOrder(req.params.orderId, req.user.id, req.user.role === "admin");
    return res.status(200).json({ success: true, message: "Order fetched", data: order });
  } catch (error) {
    return next(error);
  }
};

export const cancelOrderController = async (req, res, next) => {
  try {
    const order = await cancelOrder(req.params.orderId, req.user.id, req.user.role === "admin");
    return res.status(200).json({ success: true, message: "Order cancelled", data: order });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderTrackingController = async (req, res, next) => {
  try {
    const order = await updateOrderTracking(req.params.orderId, req.body);
    return res.status(200).json({ success: true, message: "Tracking updated", data: order });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatusController = async (req, res, next) => {
  try {
    const order =
      req.body.orderStatus === "cancelled"
        ? await cancelOrder(req.params.orderId, req.user.id, true)
        : await updateOrderStatus(req.params.orderId, req.body.orderStatus);
    return res.status(200).json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    return next(error);
  }
};
