import Coupon from "./coupon.model.js";

export const couponRepository = {
  create: (data) => Coupon.create(data),
  findByCode: (code) => Coupon.findOne({ code: code.toUpperCase() }),
  findById: (id) => Coupon.findById(id),
  list: () => Coupon.find().sort({ createdAt: -1 }).limit(200),
  update: (id, data) =>
    Coupon.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }),
  delete: (id) => Coupon.findByIdAndDelete(id),
};
