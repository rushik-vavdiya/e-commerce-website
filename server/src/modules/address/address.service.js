import { addressRepository } from "./address.repository.js";
import { AppError } from "../../utils/AppError.js";

const allowedFields = [
  "fullName",
  "phone",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "postalCode",
  "country",
  "default",
  "type",
];

const getAddressData = (data) => {
  const addressData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      addressData[field] = data[field];
    }
  }

  return addressData;
};

export const getAddresses = async (userId) => {
  const addresses = await addressRepository.getAddressesByUserId(userId);
  return addresses;
};

export const getAddress = async (addressId, userId) => {
  const address = await addressRepository.getAddressById(addressId, userId);
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  return address;
};

export const createAddress = async (userId, data) => {
  const addressData = getAddressData(data);
  addressData.userId = userId;
  const currentAddresses = await addressRepository.getAddressesByUserId(userId);
  const shouldBeDefault = addressData.default === true || currentAddresses.length === 0;
  addressData.default = false;
  const address = await addressRepository.createAddress(addressData);
  return shouldBeDefault ? addressRepository.setDefaultAddress(address._id, userId) : address;
};

export const updateAddress = async (addressId, userId, data) => {
  const addressData = getAddressData(data);
  const existingAddress = await addressRepository.getAddressById(addressId, userId);
  if (!existingAddress) {
    throw new AppError("Address not found", 404);
  }

  let address;
  if (addressData.default === true) {
    address = await addressRepository.setDefaultAddress(addressId, userId);
    delete addressData.default;
    if (address && Object.keys(addressData).length) {
      address = await addressRepository.updateAddress(addressId, userId, addressData);
    }
  } else {
    address = await addressRepository.updateAddress(addressId, userId, addressData);
  }
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  if (data.default === false && existingAddress.default) {
    const replacement = await addressRepository.getMostRecentAddress(userId, addressId);
    if (replacement && replacement._id.toString() !== addressId.toString()) {
      address = await addressRepository.setDefaultAddress(replacement._id, userId);
    }
  }

  return address;
};

export const deleteAddress = async (addressId, userId) => {
  const address = await addressRepository.deleteAddress(addressId, userId);
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  if (address.default) {
    const replacement = await addressRepository.getMostRecentAddress(userId);
    if (replacement) await addressRepository.setDefaultAddress(replacement._id, userId);
  }

  return address;
};
