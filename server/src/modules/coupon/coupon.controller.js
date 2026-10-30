import * as couponService from "./coupon.service.js";

export const createCoupon = async (req, res, next) => {
  try {
    return res.status(201).json({
      success: true,
      message: "Coupon created",
      data: await couponService.createCoupon(req.body),
    });
  } catch (error) {
    return next(error);
  }
};

export const listCoupons = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Coupons fetched",
      data: await couponService.listCoupons(),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Coupon updated",
      data: await couponService.updateCoupon(req.params.couponId, req.body),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await couponService.deleteCoupon(req.params.couponId);
    return res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return next(error);
  }
};

// POST /coupons/validate — checks the code against the caller's own cart.
export const validateCoupon = async (req, res, next) => {
  try {
    const result = await couponService.validateCouponForCart(req.user.id, req.body.code);
    return res.json({ success: true, message: "Coupon is valid", data: result });
  } catch (error) {
    return next(error);
  }
};
