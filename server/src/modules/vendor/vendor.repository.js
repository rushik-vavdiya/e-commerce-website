import Vendor from "./vendor.model.js";
import User from "../user/user.model.js";

export const vendorRepository = {
  applyVendor: async (userId, vendorData) => {
    return await Vendor.create({
      userId,
      ...vendorData,
      approvalStatus: "pending",
      status: "inactive",
    });
  },
  getVendorByUserId: async (userId) => {
    return await Vendor.findOne({ userId });
  },
  updateVendor: async (userId, vendorData) => {
    return await Vendor.findOneAndUpdate({ userId }, { $set: vendorData }, { new: true });
  },
  getVendorById: async (vendorId) => {
    return await Vendor.findById(vendorId);
  },
  getVendors: async () => {
    return await Vendor.find().sort({ createdAt: -1 }).limit(100);
  },
  // Storefront directory: only stores an admin approved and that are still
  // active, and only the fields a shopper may see. The store's contact details,
  // social handles and the owner's user id stay out of this projection.
  getPublicVendors: async () => {
    return await Vendor.find({ approvalStatus: "approved", status: "active" })
      .sort({ storeName: 1 })
      .limit(100)
      .select("storeName storeDescription storeLogo")
      .lean();
  },
  updateApproval: async (vendorId, approvalStatus, rejectionReason) => {
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        $set: {
          approvalStatus,
          status: approvalStatus === "approved" ? "active" : "inactive",
          rejectionReason: approvalStatus === "rejected" ? rejectionReason : null,
        },
      },
      { new: true, runValidators: true },
    );
    if (vendor && approvalStatus === "approved") {
      await User.findByIdAndUpdate(vendor.userId, { $set: { role: "vendor" } });
    }
    return vendor;
  },
  // Admin ban/unban. Banned stores are parked as "suspended" so the rest of
  // the app keeps treating the vendor as not-active without losing the old
  // value. Unban simply returns the store to active.
  setVendorStatus: async (vendorId, status) => {
    return await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: { status } },
      { new: true, runValidators: true },
    );
  },
};
