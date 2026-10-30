import {
  createPayment,
  getPaymentForOrder,
  processRazorpayWebhook,
  refundPayment,
  verifyPayment,
} from "./payment.service.js";

export const createPaymentController = async (req, res, next) => {
  try {
    const data = await createPayment(req.user.id, req.body);
    return res.status(201).json({ success: true, message: "Payment started", data });
  } catch (error) {
    return next(error);
  }
};

export const verifyPaymentController = async (req, res, next) => {
  try {
    const payment = await verifyPayment(req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Payment verified", data: payment });
  } catch (error) {
    return next(error);
  }
};

export const getOrderPaymentController = async (req, res, next) => {
  try {
    const payment = await getPaymentForOrder(req.params.orderId);
    return res.status(200).json({ success: true, message: "Payment fetched", data: payment });
  } catch (error) {
    return next(error);
  }
};

export const refundPaymentController = async (req, res, next) => {
  try {
    const refund = await refundPayment(req.params.paymentId, req.body.amount);
    return res.status(202).json({ success: true, message: "Refund requested", data: refund });
  } catch (error) {
    return next(error);
  }
};

export const razorpayWebhookController = async (req, res) => {
  try {
    await processRazorpayWebhook(
      req.body,
      req.get("x-razorpay-signature"),
      req.get("x-razorpay-event-id"),
    );
    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch {
    return res
      .status(400)
      .json({ success: false, message: "Payment webhook could not be verified" });
  }
};
