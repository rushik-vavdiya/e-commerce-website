import { vendorRepository } from "./vendor.repository.js";
import { AppError } from "../../utils/AppError.js";

// The store profile fields a vendor may set for itself. Anything else in the
// request body is ignored.
const editableFields = [
  "storeName",
  "storeDescription",
  "storeAddress",
  "storeContact",
  "storeEmail",
  "storeSocial",
];

const pickEditableFields = (vendorData) =>
  Object.fromEntries(Object.entries(vendorData).filter(([key]) => editableFields.includes(key)));

export const applyVendor = async (userId, vendorData) => {
  const existingVendor = await vendorRepository.getVendorByUserId(userId);
  if (existingVendor) {
    throw new AppError("Vendor application already exists", 409);
  }

  return vendorRepository.applyVendor(userId, pickEditableFields(vendorData));
};

export const getVendorByUserId = async (userId) => vendorRepository.getVendorByUserId(userId);

export const getVendors = async () => vendorRepository.getVendors();

// What the storefront search reads: approved, active stores only.
export const getPublicVendors = async () => vendorRepository.getPublicVendors();

export const updateVendor = async (userId, vendorData) =>
  vendorRepository.updateVendor(userId, pickEditableFields(vendorData));

// Admin decision on an application. vendorReviewSchema has already restricted
// the status and required a reason whenever the application is rejected.
export const reviewVendorApplication = async (vendorId, approvalStatus, rejectionReason) =>
  vendorRepository.updateApproval(vendorId, approvalStatus, rejectionReason?.trim());

// Admin ban or unban. Only an approved, active store can be banned, and only a
// banned store can be returned to active.
export const setVendorStatus = async (vendorId, status) => {
  const vendor = await vendorRepository.getVendorById(vendorId);
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }
  if (status === "suspended" && vendor.status !== "active") {
    throw new AppError("Only an active vendor can be banned", 400);
  }
  if (status === "active" && vendor.status !== "suspended") {
    throw new AppError("Only a banned vendor can be unbanned", 400);
  }
  if (vendor.approvalStatus !== "approved") {
    throw new AppError("Only an approved vendor can be banned or unbanned", 400);
  }

  return vendorRepository.setVendorStatus(vendorId, status);
};
