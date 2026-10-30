import {
  createAddress,
  deleteAddress,
  getAddress,
  getAddresses,
  updateAddress,
} from "./address.service.js";

export const getAddressesController = async (req, res, next) => {
  try {
    const addresses = await getAddresses(req.user.id);
    return res.status(200).json({ success: true, message: "Addresses fetched", data: addresses });
  } catch (error) {
    return next(error);
  }
};

export const getAddressController = async (req, res, next) => {
  try {
    const address = await getAddress(req.params.addressId, req.user.id);
    return res.status(200).json({ success: true, message: "Address fetched", data: address });
  } catch (error) {
    return next(error);
  }
};

export const createAddressController = async (req, res, next) => {
  try {
    const address = await createAddress(req.user.id, req.body);
    return res.status(201).json({ success: true, message: "Address created", data: address });
  } catch (error) {
    return next(error);
  }
};

export const updateAddressController = async (req, res, next) => {
  try {
    const address = await updateAddress(req.params.addressId, req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Address updated", data: address });
  } catch (error) {
    return next(error);
  }
};

export const deleteAddressController = async (req, res, next) => {
  try {
    const address = await deleteAddress(req.params.addressId, req.user.id);
    return res.status(200).json({ success: true, message: "Address deleted", data: address });
  } catch (error) {
    return next(error);
  }
};
