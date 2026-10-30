import * as vendorService from "./vendor.service.js";

const currentUserId = (req) => req.user?.id ?? req.user?._id;

export const applyVendor = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await vendorService.applyVendor(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Vendor application submitted successfully",
      data: vendor,
    });
  } catch (error) {
    return next(error);
  }
};

export const getVendorByUserId = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await vendorService.getVendorByUserId(userId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    return next(error);
  }
};

// Public: the store directory the storefront search suggests from. Signed-out
// shoppers can call it, so it only ever returns approved, active stores.
export const getPublicVendors = async (req, res, next) => {
  try {
    const vendors = await vendorService.getPublicVendors();
    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: vendors,
    });
  } catch (error) {
    return next(error);
  }
};

export const getVendors = async (req, res, next) => {
  try {
    const vendors = await vendorService.getVendors();
    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: vendors,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await vendorService.updateVendor(userId, req.body);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    return next(error);
  }
};

export const setVendorStatusRecord = async (req, res, next) => {
  try {
    const vendor = await vendorService.setVendorStatus(req.params.vendorId, req.body.status);
    return res.status(200).json({
      success: true,
      message: req.body.status === "suspended" ? "Vendor banned" : "Vendor unbanned",
      data: vendor,
    });
  } catch (error) {
    return next(error);
  }
};

export const reviewVendorApplication = async (req, res, next) => {
  try {
    const vendor = await vendorService.reviewVendorApplication(
      req.params.vendorId,
      req.body.approvalStatus,
      req.body.rejectionReason,
    );
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Vendor application updated", data: vendor });
  } catch (error) {
    return next(error);
  }
};
